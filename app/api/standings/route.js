import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30  // 30 days
const CURRENT_CACHE_SECONDS = 60 * 60 * 3      // 3 hours

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

    const cacheKey = `standings:${league}:${season}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log(`[standings] Redis hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached })
    }

    console.log(`[standings] Redis miss — fetching ${cacheKey}`)

    const res = await fetchApiFootball(`/standings?league=${league}&season=${season}`, {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
      }
    )

    if (!res.ok) return apiFootballErrorResponse(res, "Failed to fetch standings")

    const data = await res.data
    const standings = data.response

    const ttl = season === CURRENT_SEASON
      ? CURRENT_CACHE_SECONDS
      : PAST_CACHE_SECONDS

    await redis.set(cacheKey, standings, { ex: ttl })

    return Response.json({ success: true, data: standings })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })