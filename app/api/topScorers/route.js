import { redis } from "@/lib/redis"

const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const CURRENT_CACHE_SECONDS = 60 * 60 * 3

export async function GET(request) {
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

    const cacheKey = `topscorers:${league}:${season}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log(`[topscorers] Redis hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached })
    }

    console.log(`[topscorers] Redis miss — fetching ${cacheKey}`)

    const res = await fetch(
      `https://v3.football.api-sports.io/players/topscorers?league=${league}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch top scorers" },
        { status: 502 }
      )
    }

    const data = await res.json()
    const scorers = data.response

    const ttl = season === CURRENT_SEASON
      ? CURRENT_CACHE_SECONDS
      : PAST_CACHE_SECONDS

    await redis.set(cacheKey, scorers, { ex: ttl })

    return Response.json({ success: true, data: scorers })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}