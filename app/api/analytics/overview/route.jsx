
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

export const dynamic = "force-dynamic";

const MAX_RANGE_DAYS = 90;
const DAY_IN_MS = 86400000;

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
  const defaultTo = parseDate(today);
  const defaultFrom = new Date(defaultTo);

  defaultFrom.setUTCDate(defaultFrom.getUTCDate() - 6);

  const fromValue =
    searchParams.get("from") ||
    defaultFrom.toISOString().slice(0, 10);

  const toValue = searchParams.get("to") || today;

  const from = parseDate(fromValue);
  const to = parseDate(toValue);

  if (!from || !to || from > to) {
    return null;
  }

  const days =
    Math.floor((to.getTime() - from.getTime()) / DAY_IN_MS) + 1;

  if (days > MAX_RANGE_DAYS) {
    return null;
  }

  const endExclusive = new Date(to);
  endExclusive.setUTCDate(endExclusive.getUTCDate() + 1);

  return {
    from,
    to,
    endExclusive,
    days,
  };
}

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

const getOverview = async (request) => {
  try {
    // Only explicitly configured administrators can access analytics.
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

    const { from, endExclusive, days } = range;

    const [
      trafficDaily,
      trafficSummary,
      visitorBreakdown,
      apiDaily,
      apiSummary,
      slowEndpoints,
    ] = await Promise.all([
      // Daily page views and unique visitors.
      prisma.$queryRaw`
        SELECT
          date_trunc('day', "createdAt") AS "day",
          COUNT(*)::int AS "pageViews",
          COUNT(DISTINCT "visitorId")::int AS "uniqueVisitors"
        FROM "analytics_events"
        WHERE "createdAt" >= ${from}
          AND "createdAt" < ${endExclusive}
          AND "eventType" = 'page_view'
        GROUP BY date_trunc('day', "createdAt")
        ORDER BY "day" ASC
      `,

      // Page views and unique visitors across the selected period.
      prisma.$queryRaw`
        SELECT
          COUNT(*)::int AS "pageViews",
          COUNT(DISTINCT "visitorId")::int AS "uniqueVisitors"
        FROM "analytics_events"
        WHERE "createdAt" >= ${from}
          AND "createdAt" < ${endExclusive}
          AND "eventType" = 'page_view'
      `,

      // Count distinct visitors as signed-in or anonymous.
      // A visitor is signed-in if any of their page views has a userId.
      prisma.$queryRaw`
        WITH visitor_status AS (
          SELECT
            "visitorId",
            BOOL_OR("userId" IS NOT NULL) AS "isSignedIn"
          FROM "analytics_events"
          WHERE "createdAt" >= ${from}
            AND "createdAt" < ${endExclusive}
            AND "eventType" = 'page_view'
            AND "visitorId" IS NOT NULL
          GROUP BY "visitorId"
        )
        SELECT
          COUNT(*) FILTER (
            WHERE "isSignedIn" = TRUE
          )::int AS "signedInVisitors",
          COUNT(*) FILTER (
            WHERE "isSignedIn" = FALSE
          )::int AS "anonymousVisitors"
        FROM visitor_status
      `,

      // Daily API requests and errors.
      prisma.$queryRaw`
        SELECT
          date_trunc('day', "createdAt") AS "day",
          COUNT(*)::int AS "requests",
          COUNT(*) FILTER (
            WHERE "statusCode" >= 400
          )::int AS "errors",
          COUNT(*) FILTER (
            WHERE "statusCode" >= 500
          )::int AS "serverErrors"
        FROM "api_request_logs"
        WHERE "createdAt" >= ${from}
          AND "createdAt" < ${endExclusive}
        GROUP BY date_trunc('day', "createdAt")
        ORDER BY "day" ASC
      `,

      // Overall API performance.
      prisma.$queryRaw`
        SELECT
          COUNT(*)::int AS "totalRequests",
          COUNT(*) FILTER (
            WHERE "statusCode" >= 400
          )::int AS "totalErrors",
          COUNT(*) FILTER (
            WHERE "statusCode" >= 500
          )::int AS "serverErrors",
          COALESCE(
            ROUND(AVG("durationMs"))::int,
            0
          ) AS "averageResponseTimeMs",
          COALESCE(
            (
              percentile_cont(0.95)
              WITHIN GROUP (ORDER BY "durationMs")
            )::int,
            0
          ) AS "p95ResponseTimeMs"
        FROM "api_request_logs"
        WHERE "createdAt" >= ${from}
          AND "createdAt" < ${endExclusive}
      `,

      // Slowest endpoints, grouped without query parameters.
      prisma.$queryRaw`
        SELECT
          split_part("path", '?', 1) AS "endpoint",
          COUNT(*)::int AS "requests",
          COUNT(*) FILTER (
            WHERE "statusCode" >= 400
          )::int AS "errors",
          COALESCE(
            ROUND(AVG("durationMs"))::int,
            0
          ) AS "averageResponseTimeMs",
          COALESCE(
            MAX("durationMs")::int,
            0
          ) AS "maxResponseTimeMs"
        FROM "api_request_logs"
        WHERE "createdAt" >= ${from}
          AND "createdAt" < ${endExclusive}
        GROUP BY split_part("path", '?', 1)
        HAVING COUNT(*) >= 3
        ORDER BY AVG("durationMs") DESC
        LIMIT 10
      `,
    ]);

    // Index database results by date.
    const trafficByDay = new Map(
      trafficDaily.map((row) => [
        new Date(row.day).toISOString().slice(0, 10),
        row,
      ])
    );

    const apiByDay = new Map(
      apiDaily.map((row) => [
        new Date(row.day).toISOString().slice(0, 10),
        row,
      ])
    );

    // Fill missing dates with zeros for continuous charts.
    const daily = [];

    for (let i = 0; i < days; i += 1) {
      const date = new Date(from);
      date.setUTCDate(date.getUTCDate() + i);

      const day = date.toISOString().slice(0, 10);
      const traffic = trafficByDay.get(day);
      const api = apiByDay.get(day);

      daily.push({
        date: day,
        pageViews: traffic?.pageViews ?? 0,
        uniqueVisitors: traffic?.uniqueVisitors ?? 0,
        apiRequests: api?.requests ?? 0,
        apiErrors: api?.errors ?? 0,
        serverErrors: api?.serverErrors ?? 0,
      });
    }

    const traffic = trafficSummary[0];
    const visitors = visitorBreakdown[0];
    const api = apiSummary[0];

    const totalVisitors = traffic.uniqueVisitors;
    const signedInVisitors = visitors.signedInVisitors;
    const anonymousVisitors = visitors.anonymousVisitors;

    const signedInPercentage =
      totalVisitors > 0
        ? Number(
            ((signedInVisitors / totalVisitors) * 100).toFixed(1)
          )
        : 0;

    const anonymousPercentage =
      totalVisitors > 0
        ? Number(
            ((anonymousVisitors / totalVisitors) * 100).toFixed(1)
          )
        : 0;

    const totalRequests = api.totalRequests;
    const totalErrors = api.totalErrors;

    return NextResponse.json({
      range: {
        from: from.toISOString().slice(0, 10),
        to: new Date(endExclusive.getTime() - DAY_IN_MS)
          .toISOString()
          .slice(0, 10),
        days,
      },

      traffic: {
        pageViews: traffic.pageViews,
        uniqueVisitors: totalVisitors,
        signedInVisitors,
        anonymousVisitors,
        signedInPercentage,
        anonymousPercentage,
      },

      api: {
        totalRequests,
        totalErrors,
        serverErrors: api.serverErrors,
        errorRate:
          totalRequests > 0
            ? Number(
                ((totalErrors / totalRequests) * 100).toFixed(2)
              )
            : 0,
        averageResponseTimeMs: api.averageResponseTimeMs,
        p95ResponseTimeMs: api.p95ResponseTimeMs,
      },

      daily,
      slowEndpoints,
    });
  } catch (error) {
    console.error("Analytics overview failed:", error);

    return NextResponse.json(
      { error: "Unable to load analytics overview" },
      { status: 500 }
    );
  }
};

export const GET = getOverview;