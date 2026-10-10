"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export default function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastPath = useRef(null);

  const search = searchParams.toString();
  const currentPath = search
    ? `${pathname}?${search}`
    : pathname;

  useEffect(() => {
    if (!currentPath || lastPath.current === currentPath) {
      return;
    }

    lastPath.current = currentPath;

    const routePath = currentPath.split("?")[0];

    if (
      routePath === "/admin" ||
      routePath.startsWith("/admin/")
    ) {
      return;
    }

    // The custom not-found page exposes data-page-status="404".
    // Other rendered pages default to 200; this is not a way to
    // discover arbitrary server response statuses.
    const statusElement = document.querySelector("[data-page-status]");
    const reportedStatus = Number(statusElement?.getAttribute("data-page-status"));
    const statusCode =
      Number.isInteger(reportedStatus) &&
      reportedStatus >= 100 &&
      reportedStatus <= 599
        ? reportedStatus
        : 200;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        eventType: "page_view",
        path: currentPath,
        statusCode,
      }),
      credentials: "same-origin",
      keepalive: true,
    }).catch((error) => {
      console.error("Unable to send page view:", error);
    });
  }, [currentPath]);

  return null;
}