import http from "k6/http"
import { check, sleep } from "k6"

const URL =
  "https://goaliq-gamma.vercel.app/api/fixtures?league=39&season=2022"

export const options = {
  vus: 10,
  duration: "30s",

  thresholds: {
    http_req_failed: ["rate<0.01"],
    http_req_duration: ["p(95)<3000"],
  },
}

export default function () {
  const res = http.get(URL)

  check(res, {
    "fixtures returned 2xx": (r) =>
      r.status >= 200 && r.status < 300,

    "fixtures not 5xx": (r) =>
      r.status < 500,
  })

  sleep(1)
}