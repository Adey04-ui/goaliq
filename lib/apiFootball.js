// lib/apiFootball.js
// Layer 2: GLOBAL gate in front of every API-Football call.
//
// API-Football's free tier is a shared budget (10 req/min, 100 req/day) for
// the whole app, not per user. So this limiter is not keyed by client:
//   - per-minute: token bucket, capacity 10, refills 1 token every 6 seconds
//   - per-day:    counter keyed by UTC date (the daily quota resets at 00:00 UTC
//                 as far as I know - confirm on your API-Football dashboard)
//
// Both checks run in ONE Lua script so they are atomic: a token is only
// spent if the day limit also allows the call.

import { redis } from "@/lib/redis"

const BASE_URL = "https://v3.football.api-sports.io"

// Tweak these if your plan changes. Leaving a little headroom (e.g. 9 / 95)
// is wise if anything else (scripts, dev machines) shares the same key.
const MINUTE_CAPACITY = 10
const MINUTE_REFILL_PER_MS = 10 / 60000 // 1 token per 6s
const DAILY_LIMIT = 100

const GATE_SCRIPT = `
local capacity = tonumber(ARGV[1])
local refillPerMs = tonumber(ARGV[2])
local now = tonumber(ARGV[3])
local dailyLimit = tonumber(ARGV[4])

-- 1) daily budget
local dayUsed = tonumber(redis.call('GET', KEYS[2]) or '0')
if dayUsed >= dailyLimit then
  return {2, 0, 0, dayUsed}
end

-- 2) minute bucket: refill lazily from elapsed time
local data = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local tokens = tonumber(data[1])
local ts = tonumber(data[2])
if tokens == nil or ts == nil then
  tokens = capacity
  ts = now
end

tokens = math.min(capacity, tokens + math.max(0, now - ts) * refillPerMs)

if tokens < 1 then
  local retryMs = math.ceil((1 - tokens) / refillPerMs)
  return {1, retryMs, 0, dayUsed}
end

-- 3) allowed: spend a token and count it against the day
tokens = tokens - 1
redis.call('HSET', KEYS[1], 'tokens', tostring(tokens), 'ts', tostring(now))
redis.call('PEXPIRE', KEYS[1], 120000)

dayUsed = redis.call('INCR', KEYS[2])
if dayUsed == 1 then
  redis.call('EXPIRE', KEYS[2], 90000)
end

return {0, 0, math.floor(tokens), dayUsed}
`

function secondsUntilUtcMidnight(now) {
  const d = new Date(now)
  const next = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1)
  return Math.ceil((next - now) / 1000)
}

// Returns { allowed: true, minuteLeft, dayUsed }
//      or { allowed: false, reason: "minute" | "day" | "unavailable", retryAfter }
export async function acquireApiFootballSlot() {
  const now = Date.now()
  const dayKey = `apifootball:day:${new Date(now).toISOString().slice(0, 10)}`

  try {
    const [code, retryMs, minuteLeft, dayUsed] = await redis.eval(
      GATE_SCRIPT,
      ["apifootball:minute", dayKey],
      [MINUTE_CAPACITY, MINUTE_REFILL_PER_MS, now, DAILY_LIMIT]
    )

    if (code === 0) return { allowed: true, minuteLeft, dayUsed }

    if (code === 1) {
      return {
        allowed: false,
        reason: "minute",
        retryAfter: Math.max(1, Math.ceil(retryMs / 1000)),
      }
    }

    return {
      allowed: false,
      reason: "day",
      retryAfter: secondsUntilUtcMidnight(now),
    }
  } catch (err) {
    // FAIL CLOSED: if we can't verify the budget, don't risk burning the quota.
    console.error("[apiFootball] gate check failed:", err)
    return { allowed: false, reason: "unavailable", retryAfter: 30 }
  }
}

function hasApiErrors(errors) {
  if (!errors) return false
  return Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0
}

// The ONLY place GoalIQ should call API-Football from.
//   path example: "/players/topscorers?league=39&season=2025"
//
// Returns { ok: true, data } or { ok: false, reason, retryAfter?, status? }
export async function fetchApiFootball(path) {
  const slot = await acquireApiFootballSlot()
  if (!slot.allowed) {
    return { ok: false, reason: slot.reason, retryAfter: slot.retryAfter }
  }

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    })
  } catch (err) {
    console.error("[apiFootball] network error:", err)
    return { ok: false, reason: "network", retryAfter: 10 }
  }

  if (!res.ok) {
    return { ok: false, reason: "upstream", status: res.status }
  }

  const data = await res.json()

  // API-Football can report problems (including its own rate limit) inside a
  // 200 response body. Never cache those as if they were real data.
  if (hasApiErrors(data.errors)) {
    console.error("[apiFootball] error in response body:", data.errors)
    return { ok: false, reason: "upstream_error" }
  }

  return { ok: true, data }
}

// Turns a failed fetchApiFootball() result into the right Response, so each
// route needs only ONE line for error handling:
//   if (!result.ok) return apiFootballErrorResponse(result, "Failed to fetch fixtures")
//
// - budget used up / can't be checked -> 503 + Retry-After (client did nothing wrong)
// - anything else (upstream failure)  -> 502
export function apiFootballErrorResponse(result, message = "Failed to fetch data") {
  if (["minute", "day", "unavailable"].includes(result.reason)) {
    return Response.json(
      {
        success: false,
        message: "Data is temporarily unavailable. Please try again shortly.",
      },
      { status: 503, headers: { "Retry-After": String(result.retryAfter) } }
    )
  }

  return Response.json({ success: false, message }, { status: 502 })
}

// ---------------------------------------------------------------------------
// For service/library code (lib/fixtures.js, services/leaguesCache.js, ...)
// that returns data, not a Response. The service throws; the route's catch
// block turns the error into the right Response (503 + Retry-After, or 500).
//
// In a service:
//   const data = await fetchApiFootballOrThrow(`/fixtures?date=${date}`)
//
// In the route:
//   } catch (error) {
//     return routeErrorResponse(error, "fixtures-by-day")
//   }
// ---------------------------------------------------------------------------
export class ApiFootballError extends Error {
  constructor(result) {
    super(`API-Football unavailable (${result.reason})`)
    this.name = "ApiFootballError"
    this.result = result
  }
}

export async function fetchApiFootballOrThrow(path) {
  const result = await fetchApiFootball(path)
  if (!result.ok) throw new ApiFootballError(result)
  return result.data
}

export function routeErrorResponse(error, label = "route") {
  if (error instanceof ApiFootballError) {
    return apiFootballErrorResponse(error.result, "Failed to fetch data")
  }

  console.error(`[${label}] error:`, error)
  return Response.json(
    { success: false, message: "Something went wrong" },
    { status: 500 }
  )
}