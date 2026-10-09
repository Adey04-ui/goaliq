
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Code2,
  RefreshCw,
  Search,
  Server,
  Monitor,
  XCircle,
} from "lucide-react";

function localDate(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatDuration(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const duration = Number(value);

  if (!Number.isFinite(duration)) return "—";
  if (duration < 1000) return `${Math.round(duration)} ms`;

  return `${(duration / 1000).toFixed(2)} s`;
}

function getStatusCode(log) {
  const value =
    log.statusCode ??
    log.status ??
    log.payload?.statusCode ??
    log.payload?.status;

  if (value === null || value === undefined || value === "") {
    return null;
  }

  const code = Number(value);

  return Number.isInteger(code) && code >= 100 && code <= 599
    ? code
    : null;
}

function getStatusClass(status) {
  if (status === null) {
    return "logs-status logs-status--neutral";
  }

  if (status >= 400) {
    return "logs-status logs-status--error";
  }

  if (status >= 200 && status < 300) {
    return "logs-status logs-status--success";
  }

  if (status >= 300 && status < 400) {
    return "logs-status logs-status--redirect";
  }

  return "logs-status logs-status--neutral";
}

function getEventClass(type) {
  const normalized = String(type || "").toLowerCase();

  if (
    normalized.includes("error") ||
    normalized.includes("failure") ||
    normalized.includes("rejection")
  ) {
    return "logs-event logs-event--error";
  }

  if (normalized.includes("vital")) {
    return "logs-event logs-event--vital";
  }

  return "logs-event logs-event--neutral";
}

function getMessage(log, frontend) {
  return (
    log.errorMessage ||
    log.message ||
    log.error ||
    log.description ||
    log.payload?.message ||
    (frontend ? "Frontend event recorded" : "Request recorded")
  );
}

function getPath(log) {
  return log.path || log.url || log.route || log.pathname || "—";
}

function getDuration(log) {
  return (
    log.durationMs ??
    log.responseTimeMs ??
    log.duration ??
    log.payload?.durationMs
  );
}

function getTimestamp(log) {
  return log.createdAt || log.timestamp || log.time;
}

function getFrontendType(log) {
  return (
    log.eventType ||
    log.type ||
    log.payload?.eventType ||
    "unknown"
  );
}

function LogRow({ log, frontend }) {
  const [expanded, setExpanded] = useState(false);

  const timestamp = getTimestamp(log);
  const path = getPath(log);
  const message = getMessage(log, frontend);
  const eventType = getFrontendType(log);
  const status = getStatusCode(log);
  const duration = getDuration(log);

  return (
    <>
      <tr className={expanded ? "logs-row logs-row--expanded" : "logs-row"}>
        <td className="logs-cell logs-cell--time">
          <span>{formatDateTime(timestamp)}</span>
        </td>

        {frontend ? (
          <>
            <td>
              <span className={getEventClass(eventType)}>
                {eventType.replaceAll("_", " ")}
              </span>
            </td>
            <td className="logs-cell logs-cell--path">
              <code title={path}>{path}</code>
            </td>

            <td>
              <span className={getStatusClass(status)}>
                {status ?? "N/A"}
              </span>
            </td>
            <td>
              <span className="logs-message" title={message}>
                {message}
              </span>
            </td>
          </>
        ) : (
          <>
            <td>
              <span className="logs-method">{log.method || "—"}</span>
            </td>

            <td className="logs-cell logs-cell--path">
              <code title={path}>{path}</code>
            </td>

            <td>
              <span className={getStatusClass(status)}>{status ?? "—"}</span>
            </td>

            <td>
              <span
                className={
                  Number(duration) >= 1000
                    ? "logs-duration logs-duration--slow"
                    : "logs-duration"
                }
              >
                {formatDuration(duration)}
              </span>
            </td>

            <td>
              <span className="logs-message" title={message}>
                {message}
              </span>
            </td>
          </>
        )}

        <td className="logs-cell logs-cell--action">
          <button
            type="button"
            className="logs-details-button"
            aria-expanded={expanded}
            onClick={() => setExpanded((value) => !value)}
          >
            <Code2 size={14} />
            <span>{expanded ? "Hide" : "Details"}</span>
          </button>
        </td>
      </tr>

      {expanded && (
        <tr className="logs-details-row">
          <td colSpan={frontend ? 6 : 7}>
            <div className="logs-details">
              <div className="logs-details__header">
                <div>
                  <strong>Log payload</strong>
                  <span>Full recorded event data</span>
                </div>

                <button
                  type="button"
                  className="logs-details-button"
                  onClick={() => {
                    navigator.clipboard?.writeText(
                      JSON.stringify(log, null, 2)
                    );
                  }}
                >
                  Copy JSON
                </button>
              </div>

              <pre>{JSON.stringify(log, null, 2)}</pre>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function LogsExplorer({ type }) {
  const frontend = type === "frontend";

  const [from, setFrom] = useState(() => localDate(-6));
  const [to, setTo] = useState(() => localDate());
  const [search, setSearch] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("all");
  const [eventType, setEventType] = useState("all");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);

  const endpoint = frontend
    ? "/api/analytics/frontend-logs"
    : "/api/analytics/backend-logs";

  const params = useMemo(() => {
    const query = new URLSearchParams({
      from,
      to,
      search: appliedSearch,
      page: String(page),
      limit: "25",
    });

    if (frontend) {
      query.set("type", eventType);
    } else {
      query.set("status", status);
      query.set("method", method);
    }

    return query;
  }, [
    from,
    to,
    appliedSearch,
    page,
    frontend,
    eventType,
    status,
    method,
  ]);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${endpoint}?${params.toString()}`, {
        cache: "no-store",
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.error || payload.message || "Unable to load logs."
        );
      }

      setLogs(Array.isArray(payload.logs) ? payload.logs : []);
      setPagination(
        payload.pagination || {
          page: 1,
          limit: 25,
          total: 0,
          totalPages: 0,
        }
      );
      setUpdatedAt(new Date());
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Unable to load logs."
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint, params]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs, refreshKey]);

  function applyFilters(event) {
    event.preventDefault();

    if (!from || !to || from > to) {
      setError("Choose a valid date range.");
      return;
    }

    setPage(1);
    setAppliedSearch(search.trim());
    setRefreshKey((value) => value + 1);
  }

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  const errorCount = logs.filter((log) => {
    const statusCode = getStatusCode(log);

    if (statusCode !== null && statusCode >= 400) {
      return true;
    }

    const type = getFrontendType(log).toLowerCase();

    return (
      type.includes("error") ||
      type.includes("failure") ||
      type.includes("rejection")
    );
  }).length

  const Icon = frontend ? Monitor : Server;

  return (
    <main className="logs-dashboard">
      <header className="logs-heading">
        <div className="logs-heading__copy">
          <div className="logs-eyebrow">
            <span className="logs-live-dot" />
            GOALIQ / SYSTEM OBSERVABILITY
          </div>

          <h1>{frontend ? "Frontend logs" : "Backend logs"}</h1>

          <p>
            {frontend
              ? "Inspect browser errors, failed client requests and performance events."
              : "Inspect API requests, response times, HTTP errors and server failures."}
          </p>
        </div>

        <button
          type="button"
          className="logs-refresh"
          disabled={loading}
          onClick={() => setRefreshKey((value) => value + 1)}
        >
          <RefreshCw
            size={16}
            className={loading ? "logs-spin" : ""}
          />
          {loading ? "Loading" : "Refresh logs"}
        </button>
      </header>

      <nav className="logs-tabs" aria-label="Log categories">
        <a
          href="/admin/analytics/backend-logs"
          className={!frontend ? "logs-tab logs-tab--active" : "logs-tab"}
          aria-current={!frontend ? "page" : undefined}
        >
          <Server size={16} />
          Backend
        </a>

        <a
          href="/admin/analytics/frontend-logs"
          className={frontend ? "logs-tab logs-tab--active" : "logs-tab"}
          aria-current={frontend ? "page" : undefined}
        >
          <Monitor size={16} />
          Frontend
        </a>
      </nav>

      <section className="logs-summary" aria-label="Log summary">
        <article className="logs-summary-card">
          <span className="logs-summary-card__icon">
            <Activity size={18} />
          </span>
          <div>
            <span>Matching logs</span>
            <strong>
              {new Intl.NumberFormat("en-US").format(pagination.total)}
            </strong>
          </div>
        </article>

        <article className="logs-summary-card">
          <span className="logs-summary-card__icon logs-summary-card__icon--error">
            <AlertCircle size={18} />
          </span>
          <div>
            <span>Errors on this page</span>
            <strong>{errorCount}</strong>
          </div>
        </article>

        <article className="logs-summary-card">
          <span className="logs-summary-card__icon logs-summary-card__icon--success">
            <CheckCircle2 size={18} />
          </span>
          <div>
            <span>Current page</span>
            <strong>
              {pagination.totalPages
                ? `${pagination.page} / ${pagination.totalPages}`
                : "—"}
            </strong>
          </div>
        </article>

        <article className="logs-summary-card">
          <span className="logs-summary-card__icon">
            <Clock3 size={18} />
          </span>
          <div>
            <span>Last refreshed</span>
            <strong className="logs-summary-card__updated">
              {updatedAt
                ? updatedAt.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
                : "—"}
            </strong>
          </div>
        </article>
      </section>

      <section className="logs-panel">
        <form className="logs-toolbar" onSubmit={applyFilters}>
          <label className="logs-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                frontend
                  ? "Search event details..."
                  : "Search endpoint or error..."
              }
              aria-label="Search logs"
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                <XCircle size={15} />
              </button>
            )}
          </label>

          <label className="logs-field">
            <span>From</span>
            <input
              type="date"
              value={from}
              max={to}
              onChange={(event) => setFrom(event.target.value)}
            />
          </label>

          <label className="logs-field">
            <span>To</span>
            <input
              type="date"
              value={to}
              min={from}
              max={localDate()}
              onChange={(event) => setTo(event.target.value)}
            />
          </label>

          {frontend ? (
            <label className="logs-field">
              <span>Event type</span>
              <select
                value={eventType}
                onChange={(event) =>
                  changeFilter(setEventType, event.target.value)
                }
              >
                <option value="all">All events</option>
                <option value="error">Browser errors</option>
                <option value="unhandled_rejection">
                  Unhandled rejections
                </option>
                <option value="api_failure">API failures</option>
                <option value="web_vital">Web Vitals</option>
                <option value="page_view">Page views</option>
              </select>
            </label>
          ) : (
            <>
              <label className="logs-field">
                <span>Status</span>
                <select
                  value={status}
                  onChange={(event) =>
                    changeFilter(setStatus, event.target.value)
                  }
                >
                  <option value="all">All statuses</option>
                  <option value="2xx">2xx success</option>
                  <option value="3xx">3xx redirect</option>
                  <option value="4xx">4xx client errors</option>
                  <option value="5xx">5xx server errors</option>
                  <option value="errors">All errors</option>
                </select>
              </label>

              <label className="logs-field">
                <span>Method</span>
                <select
                  value={method}
                  onChange={(event) =>
                    changeFilter(setMethod, event.target.value)
                  }
                >
                  <option value="all">All methods</option>
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                  <option value="PATCH">PATCH</option>
                  <option value="DELETE">DELETE</option>
                </select>
              </label>
            </>
          )}

          <button type="submit" className="logs-apply">
            Apply filters
          </button>
        </form>

        {error && (
          <div className="logs-error" role="alert">
            <AlertCircle size={18} />
            <div>
              <strong>Unable to load logs</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={() => setRefreshKey((value) => value + 1)}
            >
              Retry
            </button>
          </div>
        )}

        <div className="logs-table-heading">
          <div>
            <span className="logs-table-heading__indicator" />
            <strong>Event stream</strong>
            <span>{frontend ? "Client telemetry" : "HTTP request telemetry"}</span>
          </div>

          <span className="logs-table-heading__count">
            {loading ? "Loading…" : `${logs.length} records loaded`}
          </span>
        </div>

        <div className="logs-table-scroll">
          <table className="logs-table">
            <thead>
              {frontend ? (
                <tr>
                  <th>Timestamp</th>
                  <th>Event</th>
                  <th>Page / route</th>
                  <th>Status</th>
                  <th>Message</th>
                  <th aria-label="Actions" />
                </tr>
              ) : (
                <tr>
                  <th>Timestamp</th>
                  <th>Method</th>
                  <th>Endpoint</th>
                  <th>Status</th>
                  <th>Duration</th>
                  <th>Message</th>
                  <th aria-label="Actions" />
                </tr>
              )}
            </thead>

            <tbody>
              {loading ? (
                Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} className="logs-skeleton-row">
                    <td colSpan={frontend ? 6 : 7}>
                      <span />
                    </td>
                  </tr>
                ))
              ) : logs.length ? (
                logs.map((log, index) => (
                  <LogRow
                    key={log.id || `${getTimestamp(log)}-${index}`}
                    log={log}
                    frontend={frontend}
                  />
                ))
              ) : !error ? (
                <tr>
                  <td colSpan={frontend ? 6 : 7}>
                    <div className="logs-empty">
                      <span><Icon size={22} /></span>
                      <strong>No logs found</strong>
                      <p>
                        Try a different date range or remove some filters.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <footer className="logs-pagination">
          <span>
            Showing{" "}
            {pagination.total
              ? (pagination.page - 1) * pagination.limit + 1
              : 0}
            {"–"}
            {Math.min(
              pagination.page * pagination.limit,
              pagination.total
            )}{" "}
            of {pagination.total} matching records
          </span>

          <div>
            <button
              type="button"
              className="logs-page-button"
              disabled={loading || page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              aria-label="Previous page"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="logs-pagination__current">
              {pagination.totalPages ? page : 0}
            </span>

            <button
              type="button"
              className="logs-page-button"
              disabled={loading || page >= pagination.totalPages}
              onClick={() =>
                setPage((value) =>
                  Math.min(pagination.totalPages, value + 1)
                )
              }
              aria-label="Next page"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </footer>
      </section>
    </main>
  );
}