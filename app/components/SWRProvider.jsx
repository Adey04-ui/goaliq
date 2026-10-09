"use client"

import { useMemo, useRef } from "react"

import { SWRConfig } from "swr"

import { useToast } from "@/lib/useToast"

import { fetcher } from "@/lib/fetcher"

const TOAST_COOLDOWN_MS = 10_000

const MAX_AUTO_RETRY_WAIT_S = 60

export default function SWRProvider({ children }) {
  const { error: showError, warn: showWarn } = useToast()

  const lastToastAt = useRef(0)

  const config = useMemo(
    () => ({
      fetcher,

      // Don't refetch the same key repeatedly within 5 minutes.
      dedupingInterval: 1000 * 60 * 5,

      // Keep the previous data visible while switching keys.
      keepPreviousData: true,

      revalidateOnFocus: false,

      revalidateOnReconnect: false,

      onError: (err) => {
        if (err.status !== 429 && err.status !== 503) return

        // One toast per cooldown, so a page that fires 10 requests
        // doesn't stack 10 identical toasts.
        const now = Date.now()

        if (
          now - lastToastAt.current <
          TOAST_COOLDOWN_MS
        ) {
          return
        }

        lastToastAt.current = now

        if (err.status === 429) {
          showWarn(
            "Too many requests",
            "Slowing down for a moment."
          )
        } else {
          showError(
            "Data temporarily unavailable",
            "We'll try again shortly."
          )
        }
      },

      onErrorRetry: (
        err,
        key,
        cfg,
        revalidate,
        { retryCount }
      ) => {
        if (err.status === 404) return

        if (retryCount >= 3) return

        let delay

        if (err.retryAfter) {
          if (err.retryAfter > MAX_AUTO_RETRY_WAIT_S) {
            return
          }

          delay = err.retryAfter * 1000
        } else {
          delay = 5000 * (retryCount + 1)
        }

        setTimeout(() => {
          revalidate({ retryCount })
        }, delay)
      },
    }),
    [showError, showWarn]
  )

  return (
    <SWRConfig value={config}>
      {children}
    </SWRConfig>
  )
}