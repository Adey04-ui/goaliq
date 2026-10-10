
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

const DAY_MS = 86400000;
const MAX_RANGE_DAYS = 90;

const ALLOWED_EVENT_TYPES = [
  "page_view",
  "error",
  "unhandled_rejection",
  "api_failure",
  "web_vital",
];

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function parseDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value || "")) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  ) {
    return null;
  }

  return date;
}

function getRange(params) {
  const today = new Date().toISOString().slice(0, 10);

  const from = parseDate(
    params.get("from") ||
      new Date(Date.now() - 6 * DAY_MS).toISOString().slice(0, 10)
  );

  const to = parseDate(params.get("to") || today);

  if (!from || !to || from > to) {
    return null;
  }

  const days =
    Math.floor((to.getTime() - from.getTime()) / DAY_MS) + 1;

  if (days > MAX_RANGE_DAYS) {
    return null;
  }

  const endExclusive = new Date(to);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  return { from, endExclusive };
}

export async function GET(request) {
  try {
    // Verify admin access.
    const allowedEmails = getAdminEmails();

    if (!allowedEmails.length) {
      return NextResponse.json(
        { error: "Analytics access is not configured" },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();

    if (!email || !allowedEmails.includes(email)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);

    // Validate date range.
    const range = getRange(searchParams);

    if (!range) {
      return NextResponse.json(
        { error: "Invalid date range. Maximum range is 90 days." },
        { status: 400 }
      );
    }

    // Pagination.
    const page = Math.max(
      1,
      Number.parseInt(searchParams.get("page") || "1", 10) || 1
    );

    const limit = Math.max(
      10,
      Math.min(
        100,
        Number.parseInt(searchParams.get("limit") || "25", 10) || 25
      )
    );

    const offset = (page - 1) * limit;

    // Filters.
    const search = (searchParams.get("search") || "")
      .trim()
      .slice(0, 120);

    const requestedType = searchParams.get("type") || "all";

    const eventType = ALLOWED_EVENT_TYPES.includes(requestedType)
      ? requestedType
      : "all";

    // Build parameterized conditions.
    const conditions = [
      'e."createdAt" >= $1',
      'e."createdAt" < $2',
    ];

    const values = [range.from, range.endExclusive];

    if (eventType !== "all") {
      values.push(eventType);
      conditions.push(`e."eventType" = $${values.length}`);
    }

    if (search) {
      values.push(`%${search}%`);
      conditions.push(
        `to_jsonb(e)::text ILIKE $${values.length}`
      );
    }

    const whereSql = conditions.join(" AND ");

    // Fetch total count and paginated logs.
    const [countRows, logRows] = await Promise.all([
      prisma.$queryRawUnsafe(
        `
          SELECT COUNT(*)::int AS total
          FROM "analytics_events" e
          WHERE ${whereSql}
        `,
        ...values
      ),

      prisma.$queryRawUnsafe(
        `
          SELECT to_jsonb(e) AS record
          FROM "analytics_events" e
          WHERE ${whereSql}
          ORDER BY e."createdAt" DESC
          LIMIT $${values.length + 1}
          OFFSET $${values.length + 2}
        `,
        ...values,
        limit,
        offset
      ),
    ]);

    const total = Number(countRows[0]?.total || 0);

    return NextResponse.json(
      {
        logs: logRows.map((row) => row.record),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (error) {
    console.error("Frontend logs failed:", error);

    return NextResponse.json(
      { error: "Unable to load frontend logs" },
      { status: 500 }
    );
  }
}