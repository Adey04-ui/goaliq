
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { withRateLimit } from "@/lib/withRateLimit";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "goaliq_visitor_id";
const MAX_BODY_BYTES = 16 * 1024;

const EVENT_TYPES = new Set([
  "page_view",
  "error",
  "unhandled_rejection",
  "api_failure",
  "web_vital",
]);

const WEB_VITALS = new Set(["LCP", "INP", "CLS"]);
const WEB_VITAL_RATINGS = new Set([
  "good",
  "needs-improvement",
  "poor",
]);

function getDevice(userAgent = "") {
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

function getSafeString(value, maxLength = 2000) {
  if (typeof value !== "string") return null;

  const cleaned = value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();

  if (!cleaned) return null;

  return cleaned.slice(0, maxLength);
}

function normalizePagePath(value) {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.length > 2048
  ) {
    return null;
  }

  try {
    const url = new URL(value, "https://goaliq.local");
    const path = `${url.pathname}${url.search}`;

    if (path.length > 512) return null;

    return path;
  } catch {
    return null;
  }
}

function normalizeResourceName(value, origin) {
  if (typeof value !== "string" || value.length > 2048) {
    return null;
  }

  try {
    const url = new URL(value, origin);

    if (url.origin !== origin) return null;

    return url.pathname.slice(0, 512);
  } catch {
    return null;
  }
}

function normalizeSource(value, origin) {
  if (!value) return null;

  return normalizeResourceName(value, origin);
}

function getOptionalInteger(value, min = 0, max = 2147483647) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < min ||
    value > max
  ) {
    return null;
  }

  return value;
}

function getOptionalMetricValue(value) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value < 0 ||
    value > 120000
  ) {
    return null;
  }

  return value;
}

function isValidVisitorId(value) {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value
    )
  );
}

function jsonError(message, status) {
  return NextResponse.json({ error: message }, { status });
}

const trackFrontendEvent = async (request) => {
  try {
    const contentLength = Number(
      request.headers.get("content-length") || 0
    );

    if (contentLength > MAX_BODY_BYTES) {
      return jsonError("Request body too large", 413);
    }

    let body;

    try {
      body = await request.json();
    } catch {
      return jsonError("Invalid JSON body", 400);
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return jsonError("Invalid request body", 400);
    }

    const eventType = body.eventType || "page_view";

    if (
      typeof eventType !== "string" ||
      !EVENT_TYPES.has(eventType)
    ) {
      return jsonError("Unsupported event type", 400);
    }

    const path = normalizePagePath(body.path);

    if (!path) {
      return jsonError("Invalid path", 400);
    }

    const pathname = path.split("?")[0];

    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return NextResponse.json({ tracked: false });
    }

    const origin = request.nextUrl.origin;
    const userAgent = (
      request.headers.get("user-agent") || ""
    ).slice(0, 1000);

    const existingCookie = request.cookies.get(COOKIE_NAME)?.value;
    const visitorId = isValidVisitorId(existingCookie)
      ? existingCookie
      : randomUUID();

    const data = {
      visitorId,
      eventType,
      path,
      device: getDevice(userAgent),
      userAgent: userAgent || null,
    };

    // Accept an optional HTTP status for any event type.
    // Never invent a status when the client does not know it.
    if (body.statusCode !== undefined && body.statusCode !== null) {
      const statusCode = getOptionalInteger(body.statusCode, 100, 599);

      if (statusCode === null) {
        return jsonError("Invalid statusCode", 400);
      }

      data.statusCode = statusCode;
    }

    if (eventType === "error" || eventType === "unhandled_rejection") {
      const message = getSafeString(body.message, 2000);

      if (!message) {
        return jsonError("An error message is required", 400);
      }

      data.message = message;
      data.stack = getSafeString(body.stack, 8000);
      data.source = normalizeSource(body.source, origin);
      data.lineNumber = getOptionalInteger(body.lineNumber);
      data.columnNumber = getOptionalInteger(body.columnNumber);
    }

    if (eventType === "api_failure") {
      const resourceName = normalizeResourceName(
        body.resourceName,
        origin
      );

      const statusCode = getOptionalInteger(
        body.statusCode,
        400,
        599
      );

      if (!resourceName || statusCode === null) {
        return jsonError(
          "A valid resourceName and failure statusCode are required",
          400
        );
      }

      data.resourceName = resourceName;
      data.statusCode = statusCode;
      data.message = getSafeString(body.message, 1000);
    }

    if (eventType === "web_vital") {
      const metricName = body.metricName;
      const metricValue = getOptionalMetricValue(body.metricValue);
      const metricRating = body.metricRating;

      if (!WEB_VITALS.has(metricName)) {
        return jsonError("Unsupported web vital", 400);
      }

      if (metricValue === null) {
        return jsonError("Invalid metric value", 400);
      }

      if (
        metricRating != null &&
        !WEB_VITAL_RATINGS.has(metricRating)
      ) {
        return jsonError("Invalid metric rating", 400);
      }

      if (metricName === "CLS" && metricValue > 10) {
        return jsonError("Invalid CLS value", 400);
      }

      data.metricName = metricName;
      data.metricValue = metricValue;
      data.metricRating = metricRating || null;
    }

    const session = await getServerSession(authOptions);
    data.userId = session?.user?.id || null;

    await prisma.analyticsEvent.create({ data });

    const response = NextResponse.json({ tracked: true });

    if (!isValidVisitorId(existingCookie)) {
      response.cookies.set(COOKIE_NAME, visitorId, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }

    return response;
  } catch (error) {
    console.error("Analytics tracking failed:", error);

    return NextResponse.json(
      { error: "Unable to record analytics" },
      { status: 500 }
    );
  }
};

export const POST = withRateLimit(trackFrontendEvent, {
  limiter: "analytics",
});