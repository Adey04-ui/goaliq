
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Clock3,
  Eye,
  Gauge,
  Globe2,
  RefreshCw,
  Server,
  ShieldAlert,
  Users,
  ChevronRight,
  CalendarDays,
  Zap,
  Check,
  ChevronDown,
} from "lucide-react";
import * as Select from "@radix-ui/react-select";
import { useRouter } from "next/navigation";

const DATE_RANGES = [
  { label: "Last 7 days", value: "7" },
  { label: "Last 30 days", value: "30" },
  { label: "Last 90 days", value: "90" },
];

function getDateRange(days) {
  const to = new Date();
  const from = new Date(to);

  from.setDate(from.getDate() - Number(days) + 1);

  const format = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return { from: format(from), to: format(to) };
}

function extractArray(payload, keys = []) {
  if (Array.isArray(payload)) return payload;

  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key];
    if (Array.isArray(payload?.data?.[key])) return payload.data[key];
  }

  if (Array.isArray(payload?.data)) return payload.data;

  return [];
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US").format(Number(value) || 0);
}

function formatDuration(value) {
  const ms = Number(value);

  if (!Number.isFinite(ms)) return "—";
  if (ms < 1000) return `${Math.round(ms)} ms`;

  return `${(ms / 1000).toFixed(2)} s`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function formatDateTime(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatusClass(status) {
  const code = Number(status);

  if (code >= 500) return "analytics-status--error";
  if (code >= 400) return "analytics-status--warning";
  if (code >= 200 && code < 300) return "analytics-status--success";

  return "analytics-status--neutral";
}

function getErrorMessage(error) {
  return error instanceof Error
    ? error.message
    : "Unable to load analytics data.";
}

function MetricCard({
  label,
  value,
  description,
  icon: Icon,
  tone = "blue",
}) {
  return (
    <article className="analytics-metric">
      <div className="analytics-metric__top">
        <span className="analytics-metric__label">{label}</span>

        <span
          className={`analytics-metric__icon analytics-metric__icon--${tone}`}
          aria-hidden="true"
        >
          <Icon size={18} strokeWidth={1.8} />
        </span>
      </div>

      <div className="analytics-metric__value">{value}</div>

      <div className="analytics-metric__description">{description}</div>
    </article>
  );
}

function PanelHeader({ title, subtitle, action }) {
  return (
    <div className="analytics-panel__header">
      <div>
        <h2 className="analytics-panel__title">{title}</h2>
        {subtitle && (
          <p className="analytics-panel__subtitle">{subtitle}</p>
        )}
      </div>

      {action}
    </div>
  );
}

function EmptyState({ message }) {
  return (
    <div className="analytics-empty">
      <span className="analytics-empty__icon">
        <Activity size={20} />
      </span>
      <p>{message}</p>
    </div>
  );
}

function LoadingRows({ count = 4 }) {
  return (
    <div className="analytics-loading-rows" aria-label="Loading">
      {Array.from({ length: count }, (_, index) => (
        <div className="analytics-loading-row" key={index}>
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}

function TrafficChart({ data }) {
  const points = useMemo(() => {
    return data.map((item, index) => ({
      label: formatDate(
        item.date || item.day || item.createdAt || item.timestamp
      ),
      views: Number(
        item.pageViews ?? item.pageviews ?? item.views ?? item.visits ?? 0
      ),
      requests: Number(
        item.totalRequests ?? item.requests ?? item.apiRequests ?? 0
      ),
      key: item.date || item.day || item.createdAt || index,
    }));
  }, [data]);

  const maxValue = Math.max(
    1,
    ...points.map((point) => Math.max(point.views, point.requests))
  );

  if (!points.length) {
    return <EmptyState message="No daily traffic data for this period yet." />;
  }

  return (
    <div className="analytics-chart">
      <div className="analytics-chart__legend">
        <span>
          <i className="analytics-chart__legend-dot analytics-chart__legend-dot--views" />
          Page views
        </span>
        <span>
          <i className="analytics-chart__legend-dot analytics-chart__legend-dot--requests" />
          API requests
        </span>
      </div>

      <div
        className="analytics-chart__plot"
        role="img"
        aria-label="Daily page views and API requests"
      >
        {points.map((point) => (
          <div className="analytics-chart__column" key={point.key}>
            <div className="analytics-chart__bars">
              <div
                className="analytics-chart__bar analytics-chart__bar--views"
                style={{
                  height: `${Math.max(3, (point.views / maxValue) * 100)}%`,
                }}
                title={`${point.views} page views`}
              />
              <div
                className="analytics-chart__bar analytics-chart__bar--requests"
                style={{
                  height: `${Math.max(
                    3,
                    (point.requests / maxValue) * 100
                  )}%`,
                }}
                title={`${point.requests} API requests`}
              />
            </div>

            <span className="analytics-chart__date">{point.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageRows({ pages }) {
  const maxViews = Math.max(
    1,
    ...pages.map((page) => Number(page.pageViews ?? page.views ?? 0))
  );

  if (!pages.length) {
    return <EmptyState message="No page views recorded in this period." />;
  }

  return (
    <div className="analytics-page-list">
      {pages.slice(0, 6).map((page, index) => {
        const views = Number(page.pageViews ?? page.views ?? 0);
        const visitors = Number(
          page.uniqueVisitors ?? page.visitors ?? 0
        );
        const path = page.path || "/";

        return (
          <div className="analytics-page-row" key={`${path}-${index}`}>
            <div className="analytics-page-row__main">
              <div className="analytics-page-row__path" title={path}>
                <span className="analytics-page-row__rank">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span>{path}</span>
              </div>

              <div className="analytics-page-row__bar">
                <span
                  style={{ width: `${(views / maxViews) * 100}%` }}
                />
              </div>
            </div>

            <div className="analytics-page-row__numbers">
              <strong>{formatNumber(views)}</strong>
              <span>{formatNumber(visitors)} visitors</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SlowEndpointRows({ endpoints }) {
  if (!endpoints.length) {
    return <EmptyState message="No slow endpoints to report yet." />;
  }

  return (
    <div className="analytics-endpoint-list">
      {endpoints.slice(0, 5).map((endpoint, index) => {
        // The overview API returns "endpoint", not just "path".
        const endpointPath =
          endpoint.endpoint ||
          endpoint.path ||
          endpoint.route ||
          endpoint.url;

        return (
          <div
            className="analytics-endpoint-row"
            key={`${endpointPath || "endpoint"}-${index}`}
          >
            <div className="analytics-endpoint-row__main">
              <code title={endpointPath || "Endpoint path not recorded"}>
                {endpointPath || "Route not recorded"}
              </code>

              <span>
                {formatNumber(
                  endpoint.requests ??
                  endpoint.requestCount ??
                  endpoint.totalRequests ??
                  0
                )}{" "}
                requests
              </span>
            </div>

            <strong>
              {formatDuration(
                endpoint.averageResponseTimeMs ??
                endpoint.avgDurationMs ??
                endpoint.averageDurationMs
              )}
            </strong>
          </div>
        );
      })}
    </div>
  );
}

function RequestTable({ requests, loading }) {
  if (loading) return <LoadingRows count={5} />;

  if (!requests.length) {
    return <EmptyState message="No API requests found for this period." />;
  }

  return (
    <div className="analytics-table-scroll">
      <table className="analytics-table">
        <thead>
          <tr>
            <th>Endpoint</th>
            <th>Method</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Time</th>
          </tr>
        </thead>

        <tbody>
          {requests.slice(0, 8).map((request, index) => {
            const status = Number(request.statusCode ?? 0);

            return (
              <tr key={request.id || `${request.path}-${index}`}>
                <td>
                  <div className="analytics-table__endpoint">
                    <code>{request.path || "—"}</code>
                    {request.errorType && (
                      <span className="analytics-table__error">
                        {request.errorType}
                      </span>
                    )}
                  </div>
                </td>

                <td>
                  <span className="analytics-method">
                    {request.method || "—"}
                  </span>
                </td>

                <td>
                  <span
                    className={`analytics-status ${getStatusClass(status)}`}
                  >
                    {status || "—"}
                  </span>
                </td>

                <td>
                  <span
                    className={
                      Number(request.durationMs) >= 1000
                        ? "analytics-duration--slow"
                        : ""
                    }
                  >
                    {formatDuration(request.durationMs)}
                  </span>
                </td>

                <td className="analytics-table__time">
                  {formatDateTime(request.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [range, setRange] = useState("7");
  const [overview, setOverview] = useState(null);
  const [pages, setPages] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadAnalytics = useCallback(
    async ({ silent = false } = {}) => {
      if (silent) setRefreshing(true);
      else setLoading(true);

      setError("");

      const { from, to } = getDateRange(range);
      const params = new URLSearchParams({ from, to });

      try {
        const [overviewResponse, pagesResponse, requestsResponse] =
          await Promise.all([
            fetch(`/api/analytics/overview?${params}`, {
              cache: "no-store",
            }),
            fetch(
              `/api/analytics/pages?${params}&page=1&limit=6`,
              { cache: "no-store" }
            ),
            fetch(
              `/api/analytics/requests?${params}&page=1&limit=8`,
              { cache: "no-store" }
            ),
          ]);

        const responses = [
          overviewResponse,
          pagesResponse,
          requestsResponse,
        ];

        const payloads = await Promise.all(
          responses.map(async (response) => {
            const payload = await response.json().catch(() => ({}));

            if (!response.ok) {
              throw new Error(
                payload.message ||
                payload.error ||
                `Analytics request failed (${response.status})`
              );
            }

            return payload;
          })
        );

        setOverview(payloads[0]);
        setPages(
          extractArray(payloads[1], ["pages", "results", "items"])
        );
        setRequests(
          extractArray(payloads[2], ["requests", "logs", "results", "items"])
        );
        setLastUpdated(new Date());
      } catch (loadError) {
        setError(getErrorMessage(loadError));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [range]
  );

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const traffic = overview?.traffic || {};
  const api = overview?.api || {};
  const daily = extractArray(overview, ["daily", "dailyStats", "series"]);
  const slowEndpoints = extractArray(overview, [
    "slowEndpoints",
    "slowestEndpoints",
  ]);

  const metrics = [
    {
      label: "Page views",
      value: formatNumber(traffic.pageViews),
      description: "Recorded page visits",
      icon: Eye,
      tone: "blue",
    },
    {
      label: "Unique visitors",
      value: formatNumber(traffic.uniqueVisitors),
      description: "Distinct tracked visitors",
      icon: Users,
      tone: "violet",
    },
    {
      label: "API requests",
      value: formatNumber(api.totalRequests),
      description: "Requests in selected period",
      icon: Server,
      tone: "green",
    },
    {
      label: "API errors",
      value: formatNumber(api.totalErrors),
      description: `${Number(api.errorRate || 0).toFixed(2)}% error rate`,
      icon: ShieldAlert,
      tone: "red",
    },
  ];

  return (
    <main className="analytics-dashboard">
      <header className="analytics-heading">
        <div className="analytics-heading__copy">
          <div className="analytics-eyebrow">
            <span className="analytics-live-dot" />
            GOALIQ SYSTEM INSIGHTS
          </div>

          <h1>Analytics overview</h1>

          <p>
            Understand your traffic, monitor API health, and keep an eye on
            application performance.
          </p>
        </div>

        <div className="analytics-heading__actions">
          <div className="analytics-range-picker">
            <CalendarDays
              className="analytics-range-picker__calendar"
              size={16}
              aria-hidden="true"
            />

            <Select.Root value={range} onValueChange={setRange}>
              <Select.Trigger
                className="analytics-range-picker__trigger"
                aria-label="Analytics date range"
              >
                <Select.Value />
                <Select.Icon className="analytics-range-picker__chevron">
                  <ChevronDown size={15} />
                </Select.Icon>
              </Select.Trigger>

              <Select.Portal>
                <Select.Content
                  className="analytics-range-picker__content"
                  position="popper"
                  sideOffset={8}
                  align="end"
                >
                  <Select.Viewport className="analytics-range-picker__viewport">
                    {DATE_RANGES.map((item) => (
                      <Select.Item
                        key={item.value}
                        value={item.value}
                        className="analytics-range-picker__item"
                      >
                        <Select.ItemText>{item.label}</Select.ItemText>

                        <Select.ItemIndicator className="analytics-range-picker__indicator">
                          <Check size={15} strokeWidth={2.5} />
                        </Select.ItemIndicator>
                      </Select.Item>
                    ))}
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
          </div>

          <button
            type="button"
            className="analytics-refresh"
            onClick={() => loadAnalytics({ silent: true })}
            disabled={loading || refreshing}
          >
            <RefreshCw
              size={16}
              className={refreshing ? "analytics-spin" : ""}
            />
            <span>{refreshing ? "Refreshing" : "Refresh"}</span>
          </button>
        </div>
      </header>

      {error && (
        <div className="analytics-alert" role="alert">
          <AlertTriangle size={18} />
          <div>
            <strong>Could not load analytics</strong>
            <p>{error}</p>
            <span>
              Check your admin access and confirm the analytics APIs are
              responding.
            </span>
          </div>
          <button type="button" onClick={() => loadAnalytics()}>
            Try again
          </button>
        </div>
      )}

      <section className="analytics-metrics" aria-label="Key metrics">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="analytics-secondary-metrics">
        <div className="analytics-secondary-metric">
          <span className="analytics-secondary-metric__icon">
            <Clock3 size={17} />
          </span>
          <div>
            <span>Average response time</span>
            <strong>
              {formatDuration(api.averageResponseTimeMs)}
            </strong>
          </div>
        </div>

        <div className="analytics-secondary-metric">
          <span className="analytics-secondary-metric__icon">
            <Gauge size={17} />
          </span>
          <div>
            <span>95th percentile response</span>
            <strong>
              {formatDuration(api.p95ResponseTimeMs)}
            </strong>
          </div>
        </div>

        <div className="analytics-secondary-metric">
          <span className="analytics-secondary-metric__icon">
            <Zap size={17} />
          </span>
          <div>
            <span>Server errors</span>
            <strong>{formatNumber(api.serverErrors)}</strong>
          </div>
        </div>

        <div className="analytics-secondary-metric">
          <span className="analytics-secondary-metric__icon">
            <Globe2 size={17} />
          </span>
          <div>
            <span>Reporting period</span>
            <strong>{range} days</strong>
          </div>
        </div>
      </section>

      <section className="analytics-main-grid">
        <article className="analytics-panel analytics-panel--traffic">
          <PanelHeader
            title="Traffic & requests"
            subtitle="Daily activity across your application"
            action={
              <span className="analytics-panel__period">
                {range}D
              </span>
            }
          />

          {loading ? (
            <LoadingRows count={5} />
          ) : (
            <TrafficChart data={daily} />
          )}
        </article>

        <article className="analytics-panel">
          <PanelHeader
            title="Top pages"
            subtitle="Most visited routes"
            action={<Eye size={17} className="analytics-panel__icon" />}
          />

          {loading ? (
            <LoadingRows count={5} />
          ) : (
            <PageRows pages={pages} />
          )}
        </article>
      </section>

      <section className="analytics-main-grid analytics-main-grid--bottom">
        <article className="analytics-panel">
          <PanelHeader
            title="Slow endpoints"
            subtitle="Endpoints with the highest average response time"
            action={<Gauge size={17} className="analytics-panel__icon" />}
          />

          {loading ? (
            <LoadingRows count={4} />
          ) : (
            <SlowEndpointRows endpoints={slowEndpoints} />
          )}
        </article>

        <article className="analytics-panel analytics-panel--health">
          <PanelHeader
            title="API health"
            subtitle="Request performance summary"
            action={<Activity size={17} className="analytics-panel__icon" />}
          />

          <div className="analytics-health">
            <div className="analytics-health__summary">
              <div className="analytics-health__ring">
                <span>
                  {Math.max(
                    0,
                    Math.min(100, 100 - Number(api.errorRate || 0))
                  ).toFixed(1)}
                  <small>%</small>
                </span>
              </div>

              <div>
                <strong>Successful response rate</strong>
                <p>
                  Based on recorded API request status codes.
                </p>
              </div>
            </div>

            <div className="analytics-health__line">
              <span>Average latency</span>
              <strong>
                {formatDuration(api.averageResponseTimeMs)}
              </strong>
            </div>

            <div className="analytics-health__line">
              <span>95th percentile</span>
              <strong>
                {formatDuration(api.p95ResponseTimeMs)}
              </strong>
            </div>

            <div className="analytics-health__line">
              <span>Server errors</span>
              <strong
                className={
                  Number(api.serverErrors) > 0
                    ? "analytics-text--danger"
                    : "analytics-text--success"
                }
              >
                {formatNumber(api.serverErrors)}
              </strong>
            </div>
          </div>
        </article>
      </section>

      <section className="analytics-panel analytics-panel--requests">
        <PanelHeader
          title="Recent API requests"
          subtitle="Latest requests captured by the backend monitor"
          action={
            <span className="analytics-panel__link" style={{ cursor: "pointer" }} onClick={() => {
              router.push("/admin/analytics/backend-logs")
            }}>
              Latest activity <ChevronRight size={15} />
            </span>
          }
        />

        {loading ? (
          <LoadingRows count={5} />
        ) : (
          <RequestTable requests={requests} loading={loading} />
        )}

        {!loading && requests.length > 0 && (
          <div className="analytics-table-footer">
            Showing the latest {Math.min(requests.length, 8)} loaded requests
            <span>
              {lastUpdated
                ? `Updated ${lastUpdated.toLocaleTimeString("en-GB", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}`
                : ""}
            </span>
          </div>
        )}
      </section>

      {!loading && !error && (
        <footer className="analytics-footer">
          <span>
            <span className="analytics-live-dot" />
            Monitoring data loaded
          </span>
          <span>Metrics reflect recorded events, not estimates.</span>
        </footer>
      )}
    </main>
  );
}