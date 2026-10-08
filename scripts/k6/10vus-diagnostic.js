import http from "k6/http"
import { check, sleep } from "k6"
import { Trend, Counter } from "k6/metrics"

const BASE_URL = "https://goaliq-gamma.vercel.app"

const endpointDuration = {
  leagues: new Trend("leagues_duration"),
  standings: new Trend("standings_duration"),
  fixtures: new Trend("fixtures_duration"),
  news: new Trend("news_duration"),
  matches: new Trend("matches_duration"),
}

const statusCounts = {
  leagues: {},
  standings: {},
  fixtures: {},
  news: {},
  matches: {},
}

const failedRequests = new Counter("failed_requests")

export const options = {
  vus: 10,
  duration: "30s",

  thresholds: {
    http_req_duration: ["p(95)<3000"],
  },
}

const endpoints = [
  {
    name: "leagues",
    url: `${BASE_URL}/api/leagues?filter=top_leagues`,
  },
  {
    name: "standings",
    url: `${BASE_URL}/api/standings?league=39&season=2022`,
  },
  {
    name: "fixtures",
    url: `${BASE_URL}/api/fixtures?league=39&season=2022`,
  },
  {
    name: "news",
    url: `${BASE_URL}/api/news?q=football&max=10`,
  },
  {
    name: "matches",
    url: `${BASE_URL}/api/matches`,
  },
]

export default function () {
  for (const endpoint of endpoints) {
    const res = http.get(endpoint.url, {
      tags: {
        endpoint: endpoint.name,
      },
    })

    endpointDuration[endpoint.name].add(res.timings.duration)

    const status = String(res.status)

    if (!statusCounts[endpoint.name][status]) {
      statusCounts[endpoint.name][status] = 0
    }

    statusCounts[endpoint.name][status]++

    if (res.status < 200 || res.status >= 400) {
      failedRequests.add(1)
    }

    check(res, {
      [`${endpoint.name} received response`]: (r) =>
        r.status >= 200 && r.status < 600,
    })
  }

  sleep(1)
}

export function teardown() {
  console.log("\n========== STATUS CODE SUMMARY ==========")

  for (const [endpoint, statuses] of Object.entries(statusCounts)) {
    console.log(`${endpoint}:`)

    for (const [status, count] of Object.entries(statuses)) {
      console.log(`  HTTP ${status}: ${count}`)
    }
  }

  console.log("=========================================\n")
}