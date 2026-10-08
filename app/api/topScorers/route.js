import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { fetchApiFootball } from "@/lib/apiFootball"

const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const CURRENT_CACHE_SECONDS = 60 * 60 * 3

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get("league")
    const season = searchParams.get("season")

    if (!league || !season) {
      return Response.json(
        { success: false, message: "League and season are required" },
        { status: 400 }
      )
    }

    // Only plain numbers: stops junk values from creating endless cache keys
    // (each one would be a cache miss that spends API-Football budget).
    if (!/^\d+$/.test(league) || !/^\d{4}$/.test(season)) {
      return Response.json(
        { success: false, message: "Invalid league or season" },
        { status: 400 }
      )
    }

    const cacheKey = `topscorers:${league}:${season}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log(`[topscorers] Redis hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached })
    }

    console.log(`[topscorers] Redis miss — fetching ${cacheKey}`)

    // Cache miss: this is the only path that spends API-Football budget.
    const result = await fetchApiFootball(
      `/players/topscorers?league=${league}&season=${season}`
    )

    if (!result.ok) {
      // Our budget is used up (or can't be checked): not the client's fault.
      if (["minute", "day", "unavailable"].includes(result.reason)) {
        return Response.json(
          {
            success: false,
            message: "Data is temporarily unavailable. Please try again shortly.",
          },
          { status: 503, headers: { "Retry-After": String(result.retryAfter) } }
        )
      }

      return Response.json(
        { success: false, message: "Failed to fetch top scorers" },
        { status: 502 }
      )
    }

    const scorers = result.data.response

    const ttl =
      season === CURRENT_SEASON ? CURRENT_CACHE_SECONDS : PAST_CACHE_SECONDS

    await redis.set(cacheKey, scorers, { ex: ttl })

    return Response.json({ success: true, data: scorers })
  } catch (error) {
    console.error("[topscorers] error:", error)
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })