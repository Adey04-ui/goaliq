
"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function PageViewTracker() {
  const pathname = usePathname();
  const lastPath = useRef(null);

  useEffect(() => {
    if (!pathname || lastPath.current === pathname) return;

    lastPath.current = pathname;

    // Keep admin activity out of public traffic analytics.
    if (pathname === "/admin" || pathname.startsWith("/admin/")) {
      return;
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path: pathname }),
      credentials: "same-origin",
      keepalive: true,
    }).catch((error) => {
      console.error("Unable to send page view:", error);
    });
  }, [pathname]);

  return null;
}