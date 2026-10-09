// lib/fetcher.js
// Shared SWR fetcher. Errors carry `status` and (for 429/503) `retryAfter`,
// which SWRProvider uses to decide when to retry.

export async function fetcher(url) {
  const res = await fetch(url)

  if (!res.ok) {
    const error = new Error("Request failed")
    error.status = res.status
    if (res.status === 429 || res.status === 503) {
      error.retryAfter = Number(res.headers.get("Retry-After")) || 5
    }
    throw error
  }

  return res.json()
}