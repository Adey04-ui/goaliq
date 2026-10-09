
"use client";

import { useEffect } from "react";
import { onCLS, onINP, onLCP } from "web-vitals";

const ANALYTICS_ENDPOINT = "/api/analytics/track";

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}`;
}

function getSafeMessage(value, maxLength = 2000) {
  if (typeof value !== "string") {
    return "An unknown frontend error occurred";
  }

  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .slice(0, maxLength);
}

function getSameOriginPath(value) {
  if (!value) return null;

  try {
    const url = new URL(value, window.location.origin);

    if (url.origin !== window.location.origin) {
      return null;
    }

    return url.pathname;
  } catch {
    return null;
  }
}

function sendEvent(event) {
  try {
    const payload = JSON.stringify({
      ...event,
      path: getCurrentPath(),
    });

    // Keep analytics requests out of the fetch monitor itself.
    fetch(ANALYTICS_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: payload,
      credentials: "same-origin",
      keepalive: true,
    }).catch(() => {
      // Monitoring must never interfere with the application.
    });
  } catch {
    // Ignore monitoring failures.
  }
}

function reportError(error, details = {}) {
  sendEvent({
    eventType: "error",
    message: getSafeMessage(
      details.message ||
      error?.message ||
      String(error || "Unknown frontend error")
    ),
    stack:
      typeof error?.stack === "string"
        ? error.stack.slice(0, 8000)
        : null,
    source: getSameOriginPath(details.source),
    lineNumber:
      Number.isInteger(details.lineNumber) && details.lineNumber >= 0
        ? details.lineNumber
        : null,
    columnNumber:
      Number.isInteger(details.columnNumber) && details.columnNumber >= 0
        ? details.columnNumber
        : null,
  });
}

function reportWebVital(metric) {
  sendEvent({
    eventType: "web_vital",
    metricName: metric.name,
    metricValue: metric.value,
    metricRating: metric.rating,
  });
}

function reportApiFailure(resourceName, statusCode, message) {
  sendEvent({
    eventType: "api_failure",
    resourceName,
    statusCode,
    message: message ? getSafeMessage(message, 1000) : null,
  });
}

export default function FrontendMonitor() {
  useEffect(() => {
    let active = true;

    function handleWindowError(event) {
      if (!active) return;

      reportError(event.error, {
        message: event.message,
        source: event.filename,
        lineNumber: event.lineno,
        columnNumber: event.colno,
      });
    }

    function handleUnhandledRejection(event) {
      if (!active) return;

      const reason = event.reason;

      sendEvent({
        eventType: "unhandled_rejection",
        message: getSafeMessage(
          reason?.message ||
          (typeof reason === "string"
            ? reason
            : "Unhandled promise rejection")
        ),
        stack:
          typeof reason?.stack === "string"
            ? reason.stack.slice(0, 8000)
            : null,
      });
    }

    // Monitor same-origin API requests without changing their results.
    const originalFetch = window.fetch;

    async function monitoredFetch(input, init) {
      let requestUrl;

      try {
        requestUrl =
          typeof input === "string" || input instanceof URL
            ? input.toString()
            : input?.url;
      } catch {
        requestUrl = null;
      }

      const resourcePath = getSameOriginPath(requestUrl);
      const shouldMonitor =
        resourcePath?.startsWith("/api/") &&
        resourcePath !== ANALYTICS_ENDPOINT;

      try {
        const response = await originalFetch.call(this, input, init);

        if (
          active &&
          shouldMonitor &&
          response.status >= 400 &&
          response.status <= 599
        ) {
          reportApiFailure(
            resourcePath,
            response.status,
            `API request returned HTTP ${response.status}`
          );
        }

        return response;
      } catch (error) {
        if (
          active &&
          shouldMonitor &&
          error?.name !== "AbortError"
        ) {
          // Network failures have no HTTP status. Record them as errors.
          reportError(error, {
            message: `Frontend API network failure: ${resourcePath}`,
            source: resourcePath,
          });
        }

        // Preserve the original fetch behavior.
        throw error;
      }
    }

    window.addEventListener("error", handleWindowError);
    window.addEventListener(
      "unhandledrejection",
      handleUnhandledRejection
    );

    window.fetch = monitoredFetch;

    onLCP(reportWebVital);
    onINP(reportWebVital);
    onCLS(reportWebVital);

    return () => {
      active = false;

      window.removeEventListener("error", handleWindowError);
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );

      // Avoid overwriting another fetch wrapper installed afterward.
      if (window.fetch === monitoredFetch) {
        window.fetch = originalFetch;
      }
    };
  }, []);

  return null;
}