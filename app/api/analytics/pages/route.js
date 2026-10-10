
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

const MAX_RANGE_DAYS = 90;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

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

function getDateRange(searchParams) {
  const today = new Date().toISOString().slice(0, 10);
  const to = parseDate(searchParams.get("to") || today);

  if (!to) return null;

  const defaultFrom = new Date(to);
  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 6);

  const from = parseDate(
    searchParams.get("from") ||
      defaultFrom.toISOString().slice(0, 10)
  );

  if (!from || from > to) return null;

  const days =
    Math.floor((to.getTime() - from.getTime()) / 86400000) + 1;

  if (days > MAX_RANGE_DAYS) return null;

  const endExclusive = new Date(to);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  return { from, to, endExclusive, days };
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function parsePositiveInteger(value, fallback, maximum) {
  if (value === null) return fallback;

  if (!/^\d+$/.test(value)) return null;

  const number = Number(value);

  if (!Number.isSafeInteger(number) || number < 1) {
    return null;
  }

  return Math.min(number, maximum);
}

const getPopularPages = async (request) => {
  try {
    const adminEmails = getAdminEmails();

    if (adminEmails.length === 0) {
      return NextResponse.json(
        { error: "Analytics access is not configured" },
        { status: 503 }
      );
    }

    const session = await getServerSession(authOptions);
    const email = session?.user?.email?.toLowerCase();

    if (!email || !adminEmails.includes(email)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = getDateRange(searchParams);

    if (!range) {
      return NextResponse.json(
        {
          error:
            "Invalid date range. Use YYYY-MM-DD and select no more than 90 days.",
        },
        { status: 400 }
      );
    }

    const limit = parsePositiveInteger(
      searchParams.get("limit"),
      DEFAULT_LIMIT,
      MAX_LIMIT
    );

    const page = parsePositiveInteger(
      searchParams.get("page"),
      1,
      1000000
    );

    if (limit === null || page === null) {
      return NextResponse.json(
        { error: "Invalid pagination parameters" },
        { status: 400 }
      );
    }

    const offset = (page - 1) * limit;

    if (!Number.isSafeInteger(offset)) {
      return NextResponse.json(
        { error: "Page number is too large" },
        { status: 400 }
      );
    }

    const { from, to, endExclusive, days } = range;

    const [countResult, pages] = await Promise.all([
      prisma.$queryRaw`
        SELECT COUNT(*)::int AS "total"
        FROM (
          SELECT "path"
          FROM "analytics_events"
          WHERE "createdAt" >= ${from}
            AND "createdAt" < ${endExclusive}
            AND "eventType" = 'page_view'
            AND "path" NOT LIKE '/admin%'
          GROUP BY "path"
        ) AS grouped_pages
      `,

      prisma.$queryRaw`
        SELECT
          "path",
          COUNT(*)::int AS "pageViews",
          COUNT(DISTINCT "visitorId")::int AS "uniqueVisitors",
          MAX("createdAt") AS "lastVisitedAt"
        FROM "analytics_events"
        WHERE "createdAt" >= ${from}
          AND "createdAt" < ${endExclusive}
          AND "eventType" = 'page_view'
          AND "path" NOT LIKE '/admin%'
        GROUP BY "path"
        ORDER BY COUNT(*) DESC, "path" ASC
        LIMIT ${limit}
        OFFSET ${offset}
      `,
    ]);

    const total = countResult[0]?.total ?? 0;

    return NextResponse.json({
      range: {
        from: from.toISOString().slice(0, 10),
        to: to.toISOString().slice(0, 10),
        days,
      },

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + pages.length < total,
        hasPreviousPage: page > 1,
      },

      pages: pages.map((item) => ({
        path: item.path,
        pageViews: item.pageViews,
        uniqueVisitors: item.uniqueVisitors,
        lastVisitedAt: item.lastVisitedAt,
      })),
    });
  } catch (error) {
    console.error("Popular pages analytics failed:", error);

    return NextResponse.json(
      { error: "Unable to load popular pages" },
      { status: 500 }
    );
  }
};

export const GET = getPopularPages;