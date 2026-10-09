import http from "k6/http"
import { check, sleep } from "k6"

const BASE_URL = "https://goaliq-gamma.vercel.app"

export const options = {
  vus: 1,
  duration: "30s",

  thresholds: {
    http_req_failed: ["rate<0.01"],
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

    check(res, {
      [`${endpoint.name} responded`]: (r) =>
        r.status >= 200 && r.status < 500,

      [`${endpoint.name} not 5xx`]: (r) =>
        r.status < 500,
    })
  }

  sleep(1)
}