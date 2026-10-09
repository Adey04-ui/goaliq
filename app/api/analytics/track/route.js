
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";

import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/authOptions";
import { withRateLimit } from "@/lib/withRateLimit";

export const dynamic = "force-dynamic";

const COOKIE_NAME = "goaliq_visitor_id";

function getDevice(userAgent = "") {
  if (/ipad|tablet/i.test(userAgent)) return "Tablet";
  if (/mobile|android|iphone/i.test(userAgent)) return "Mobile";
  return "Desktop";
}

const trackPageView = async (request) => {
  try {
    const body = await request.json();
    const path = body?.path;

    if (
      typeof path !== "string" ||
      !path.startsWith("/") ||
      path.startsWith("//") ||
      path.length > 512
    ) {
      return NextResponse.json(
        { error: "Invalid path" },
        { status: 400 }
      );
    }

    // Do not include admin usage in public traffic analytics.
    if (path === "/admin" || path.startsWith("/admin/")) {
      return NextResponse.json({ tracked: false });
    }

    const session = await getServerSession(authOptions);

    const visitorId =
      request.cookies.get(COOKIE_NAME)?.value || randomUUID();

    const userAgent = request.headers.get("user-agent") || "";
    const device = getDevice(userAgent);

    await prisma.analyticsEvent.create({
      data: {
        visitorId,
        userId: session?.user?.id || null,
        eventType: "page_view",
        path,
        device,
      },
    });

    const response = NextResponse.json({ tracked: true });

    if (!request.cookies.has(COOKIE_NAME)) {
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
}

export const POST = withRateLimit(trackPageView, {
  limiter: "analytics",
});