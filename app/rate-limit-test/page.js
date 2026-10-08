"use client"

import { useState } from "react"
import useSWR from "swr"

const TEST_URL = `/api/rate-limit-test`

export default function RateLimitTestPage() {
  const [count, setCount] = useState(0)
  const [results, setResults] = useState([])

  const runTest = async () => {
    setResults([])
    setCount(0)

    const total = 60

    const requests = Array.from(
      { length: total },
      (_, index) => {
        const requestNumber = index + 1

        return fetch(`${TEST_URL}?request=${requestNumber}`)
          .then(async (response) => {
            const data = await response.json().catch(() => null)

            return {
              requestNumber,
              status: response.status,
              remaining:
                response.headers.get(
                  "X-RateLimit-Remaining"
                ),
              retryAfter:
                response.headers.get("Retry-After"),
              data,
            }
          })
          .catch((error) => ({
            requestNumber,
            status: "ERROR",
            error: error.message,
          }))
      }
    )

    const responses = await Promise.all(requests)

    setResults(responses)

    setCount(
      responses.filter(
        (result) => result.status === 429
      ).length
    )
  }

  const successful = results.filter(
    (result) => result.status === 200
  ).length

  const blocked = results.filter(
    (result) => result.status === 429
  ).length

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        background: "#0c1117",
        color: "white",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h1>Rate Limit Test</h1>

        <p
          style={{
            color: "#9ca3af",
            marginBottom: "24px",
          }}
        >
          Sends 60 requests to the real standings API
          from the browser.
        </p>

        <button
          onClick={runTest}
          style={{
            padding: "12px 20px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Send 60 Requests
        </button>

        {results.length > 0 && (
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "30px",
            }}
          >
            <div>
              <strong>{results.length}</strong>
              <br />
              Total
            </div>

            <div>
              <strong>{successful}</strong>
              <br />
              Successful
            </div>

            <div>
              <strong>{blocked}</strong>
              <br />
              Rate Limited
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div style={{ marginTop: "30px" }}>
            {results.map((result) => (
              <div
                key={result.requestNumber}
                style={{
                  padding: "8px 12px",
                  marginBottom: "4px",
                  borderRadius: "6px",
                  background:
                    result.status === 429
                      ? "#3b1515"
                      : "#14251a",
                }}
              >
                Request #{result.requestNumber} —{" "}
                <strong>{result.status}</strong>

                {result.status === 429 && (
                  <span>
                    {" "}
                    — Retry after{" "}
                    {result.retryAfter}s
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}