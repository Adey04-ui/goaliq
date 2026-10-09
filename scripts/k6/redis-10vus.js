import http from "k6/http"
import { check, sleep } from "k6"
import { Trend } from "k6/metrics"

const URL =
  "https://goaliq-gamma.vercel.app/api/redis-latency-test"

const redisDuration = new Trend("redis_duration")

export const options = {
  vus: 10,
  duration: "30s",

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<3000"],
    redis_duration: ["p(95)<2500"],
  },
}

export default function () {
  const res = http.get(URL)

  check(res, {
    "redis diagnostic returned 200": (r) => r.status === 200,
    "redis cache hit": (r) => {
      try {
        return r.json("cacheHit") === true
      } catch {
        return false
      }
    },
  })

  try {
    redisDuration.add(Number(res.json("redisDurationMs")))
  } catch {}

  sleep(1)
}