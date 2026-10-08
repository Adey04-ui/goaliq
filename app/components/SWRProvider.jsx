"use client"

import { useMemo, useRef } from "react"
import { SWRConfig } from "swr"
import { useToast } from "@/lib/useToast"
import { fetcher } from "@/lib/fetcher"

const TOAST_COOLDOWN_MS = 10_000
// If the server says "try again in an hour" (e.g. daily API budget used up),
// don't keep a retry timer alive for it. The next focus/navigation retries.
const MAX_AUTO_RETRY_WAIT_S = 60

export default function SWRProvider({ children }) {
  const { error: showError } = useToast()
  const lastToastAt = useRef(0)

  const config = useMemo(
    () => ({
      fetcher,

      onError: (err) => {
        if (err.status !== 429 && err.status !== 503) return

        // One toast per cooldown, so a page that fires 10 requests doesn't
        // stack 10 identical toasts.
        const now = Date.now()
        if (now - lastToastAt.current < TOAST_COOLDOWN_MS) return
        lastToastAt.current = now

        if (err.status === 429) {
          showError("Too many requests", "Slowing down for a moment.")
        } else {
          showError("Data temporarily unavailable", "We'll try again shortly.")
        }
      },

      onErrorRetry: (err, key, cfg, revalidate, { retryCount }) => {
        if (err.status === 404) return
        if (retryCount >= 3) return

        let delay
        if (err.retryAfter) {
          if (err.retryAfter > MAX_AUTO_RETRY_WAIT_S) return
          delay = err.retryAfter * 1000 // respect the server's Retry-After
        } else {
          delay = 5000 * (retryCount + 1) // simple backoff for other errors
        }

        setTimeout(() => revalidate({ retryCount }), delay)
      },
    }),
    [showError]
  )

  return <SWRConfig value={config}>{children}</SWRConfig>
}