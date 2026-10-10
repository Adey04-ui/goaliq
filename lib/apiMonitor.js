
import { getServerSession } from "next-auth";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";

const VISITOR_COOKIE = "goaliq_visitor_id";

function getErrorType(statusCode) {
  if (statusCode < 400) return null;

  if (statusCode === 400) return "Bad_Request";
  if (statusCode === 401) return "Unauthorized";
  if (statusCode === 403) return "Forbidden";
  if (statusCode === 404) return "NotFound";
  if (statusCode === 405) return "Method_Not_Allowed";
  if (statusCode === 408) return "Request_Timeout";
  if (statusCode === 409) return "Conflict";
  if (statusCode === 413) return "Payload_TooLarge";
  if (statusCode === 415) return "Unsupported_Media_Type";
  if (statusCode === 422) return "Unprocessable_Entity";
  if (statusCode === 429) return "Too_Many_Requests";

  if (statusCode >= 400 && statusCode < 500) {
    return "Client_Error_Response";
  }

  if (statusCode >= 500) {
    return "Server_Error_Response";
  }

  return null;
}


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
    const url = new URL(request.url);
    const path = `${url.pathname}${url.search}`;

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
      const durationMs = Date.now() - startedAt;

      after(() =>
        saveLog({
          ...baseLog,
          userId,
          statusCode: response.status,
          durationMs,
          errorType: getErrorType(response.status),
          errorMessage: null,
        })
      );

      return response;
    } catch (error) {
      const durationMs = Date.now() - startedAt;

      await saveLog({
        ...baseLog,
        userId,
        statusCode: 500,
        durationMs,
        errorType:
          error instanceof Error
            ? error.name.slice(0, 100)
            : "UnknownError",
        errorMessage:
          error instanceof Error
            ? error.message.slice(0, 500)
            : "An unknown error occurred",
      });

      throw error;
    }

  };
}