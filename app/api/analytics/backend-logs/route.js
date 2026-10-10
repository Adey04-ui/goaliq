
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

const MAX_RANGE_DAYS = 90;
const DAY_MS = 86400000;

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

  if (!from || !to || from > to) return null;

  const days =
    Math.floor((to.getTime() - from.getTime()) / DAY_MS) + 1;

  if (days > MAX_RANGE_DAYS) return null;

  const endExclusive = new Date(to);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  return { from, endExclusive };
}

export async function GET(request) {
  try {
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
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const range = getRange(searchParams);

    if (!range) {
      return NextResponse.json(
        { error: "Invalid date range. Maximum range is 90 days." },
        { status: 400 }
      );
    }

    const page = Math.max(
      1,
      Math.min(100000, Number.parseInt(searchParams.get("page") || "1", 10) || 1)
    );

    const limit = Math.max(
      10,
      Math.min(100, Number.parseInt(searchParams.get("limit") || "25", 10) || 25)
    );

    const search = (searchParams.get("search") || "").trim().slice(0, 120);
    const status = searchParams.get("status") || "all";
    const method = (searchParams.get("method") || "all").toUpperCase();

    const where = {
      createdAt: {
        gte: range.from,
        lt: range.endExclusive,
      },
    };

    if (["2xx", "3xx", "4xx", "5xx"].includes(status)) {
      const start = Number(status[0]) * 100;

      where.statusCode = {
        gte: start,
        lt: start + 100,
      };
    } else if (status === "errors") {
      where.statusCode = { gte: 400 };
    }

    if (
      ["GET", "POST", "PUT", "PATCH", "DELETE"].includes(method)
    ) {
      where.method = method;
    }

    if (search) {
      where.OR = [
        { path: { contains: search, mode: "insensitive" } },
        { method: { contains: search, mode: "insensitive" } },
        { errorType: { contains: search, mode: "insensitive" } },
        { errorMessage: { contains: search, mode: "insensitive" } },
      ];
    }

    const [total, logs] = await Promise.all([
      prisma.apiRequestLog.count({ where }),

      prisma.apiRequestLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    return NextResponse.json({
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Backend logs failed:", error);

    return NextResponse.json(
      { error: "Unable to load backend logs" },
      { status: 500 }
    );
  }
}