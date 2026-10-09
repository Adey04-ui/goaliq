
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

const VISITOR_COOKIE = "goaliq_visitor_id";

function getClientIp(request) {
  const realIp = request.headers.get("x-real-ip")?.trim();

  if (realIp && !realIp.includes(",") && realIp.length <= 45) {
    return realIp;
  }

  return null;
}

function getVisitorId(request) {
  const value = request.cookies.get(VISITOR_COOKIE)?.value;

  if (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  ) {
    return value;
  }

  return null;
}

async function saveLog(data) {
  try {
    await prisma.apiRequestLog.create({ data });
  } catch (error) {
    console.error("API monitoring write failed:", error);
  }
}

export function withApiMonitoring(handler) {
  return async function monitoredHandler(request, context) {
    const startedAt = Date.now();
    const path = new URL(request.url).pathname;

    const baseLog = {
      visitorId: getVisitorId(request),
      ipAddress: getClientIp(request),
      method: request.method,
      path,
      userAgent: request.headers.get("user-agent")?.slice(0, 512) || null,
    };

    let userId = null;

    try {
      const session = await getServerSession(authOptions);
      userId = session?.user?.id || null;
    } catch {
      // Monitoring must not prevent the route from running.
    }

    try {
      const response = await handler(request, context);

      await saveLog({
        ...baseLog,
        userId,
        statusCode: response.status,
        durationMs: Date.now() - startedAt,
        errorType: response.status >= 500 ? "ServerErrorResponse" : null,
      });

      return response;
    } catch (error) {
      await saveLog({
        ...baseLog,
        userId,
        statusCode: 500,
        durationMs: Date.now() - startedAt,
        errorType:
          error instanceof Error
            ? error.name.slice(0, 100)
            : "UnknownError",
      });

      throw error;
    }
  };
}