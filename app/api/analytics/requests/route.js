
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

const MAX_RANGE_DAYS = 90;
const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;
const MAX_SEARCH_LENGTH = 200;

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

function parseStatus(value) {
  if (value === null || value === "") return null;

  if (!/^[1-5]\d{2}$/.test(value)) {
    return undefined;
  }

  return Number(value);
}

function parseBoolean(value) {
  if (value === null || value === "") return null;
  if (value === "true") return true;
  if (value === "false") return false;

  return undefined;
}

const getRequests = async (request) => {
  try {
    // Authenticate and authorize before querying log data.
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

    const page = parsePositiveInteger(
      searchParams.get("page"),
      1,
      1000000
    );

    const limit = parsePositiveInteger(
      searchParams.get("limit"),
      DEFAULT_LIMIT,
      MAX_LIMIT
    );

    if (page === null || limit === null) {
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

    const rawSearch = searchParams.get("search") || "";

    if (rawSearch.length > MAX_SEARCH_LENGTH) {
      return NextResponse.json(
        { error: "Search must be 200 characters or fewer" },
        { status: 400 }
      );
    }

    const search = rawSearch.trim();

    const method = searchParams.get("method")?.toUpperCase() || "";
    const statusValue = parseStatus(searchParams.get("status"));
    const serverError = parseBoolean(
      searchParams.get("serverError")
    );

    const minDurationValue = searchParams.get("minDuration");
    let minDuration = null;

    if (minDurationValue !== null && minDurationValue !== "") {
      if (!/^\d+$/.test(minDurationValue)) {
        return NextResponse.json(
          { error: "minDuration must be a non-negative integer" },
          { status: 400 }
        );
      }

      minDuration = Number(minDurationValue);

      if (
        !Number.isSafeInteger(minDuration) ||
        minDuration > 3600000
      ) {
        return NextResponse.json(
          { error: "minDuration must be between 0 and 3600000" },
          { status: 400 }
        );
      }
    }

    const allowedMethods = [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
      "HEAD",
    ];

    if (method && !allowedMethods.includes(method)) {
      return NextResponse.json(
        { error: "Unsupported HTTP method" },
        { status: 400 }
      );
    }

    if (statusValue === undefined || serverError === undefined) {
      return NextResponse.json(
        { error: "Invalid status or serverError filter" },
        { status: 400 }
      );
    }

    const where = {
      createdAt: {
        gte: range.from,
        lt: range.endExclusive,
      },

      ...(method ? { method } : {}),

      ...(statusValue !== null
        ? { statusCode: statusValue }
        : {}),

      ...(serverError === true
        ? { statusCode: { gte: 500 } }
        : serverError === false
          ? { statusCode: { lt: 500 } }
          : {}),

      ...(minDuration !== null
        ? { durationMs: { gte: minDuration } }
        : {}),

      ...(search
        ? {
            OR: [
              {
                path: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                ipAddress: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                visitorId: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                errorType: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                errorMessage: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    // A specific status code and server-error filter must both apply.
    if (
      statusValue !== null &&
      serverError === true &&
      statusValue < 500
    ) {
      return NextResponse.json({
        range: {
          from: range.from.toISOString().slice(0, 10),
          to: range.to.toISOString().slice(0, 10),
          days: range.days,
        },
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        },
        requests: [],
      });
    }

    if (
      statusValue !== null &&
      serverError === false &&
      statusValue >= 500
    ) {
      return NextResponse.json({
        range: {
          from: range.from.toISOString().slice(0, 10),
          to: range.to.toISOString().slice(0, 10),
          days: range.days,
        },
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: page > 1,
        },
        requests: [],
      });
    }

    const [total, logs] = await Promise.all([
      prisma.apiRequestLog.count({ where }),

      prisma.apiRequestLog.findMany({
        where,
        orderBy: [
          { createdAt: "desc" },
          { id: "desc" },
        ],
        skip: offset,
        take: limit,
        select: {
          id: true,
          visitorId: true,
          userId: true,
          ipAddress: true,
          method: true,
          path: true,
          statusCode: true,
          durationMs: true,
          userAgent: true,
          errorType: true,
          errorMessage: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      range: {
        from: range.from.toISOString().slice(0, 10),
        to: range.to.toISOString().slice(0, 10),
        days: range.days,
      },

      filters: {
        search,
        method: method || null,
        status: statusValue,
        serverError,
        minDuration,
      },

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + logs.length < total,
        hasPreviousPage: page > 1,
      },

      requests: logs,
    });
  } catch (error) {
    console.error("API request analytics failed:", error);

    return NextResponse.json(
      { error: "Unable to load API request logs" },
      { status: 500 }
    );
  }
};

export const GET = getRequests;