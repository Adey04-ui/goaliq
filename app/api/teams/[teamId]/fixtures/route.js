import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

const CURRENT_SEASON = "2024"
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const CURRENT_CACHE_SECONDS = 60 * 60 * 3

async function getHandler(request, { params }) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season") || CURRENT_SEASON

    const cacheKey = `team:fixtures:${teamId}:${season}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetchApiFootball(`/fixtures?team=${teamId}&season=${season}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
    })

    if (!res.ok) {
      return apiFootballErrorResponse(res, "Failed to fetch fixtures")
    }

    const data = await res.data

    const fixtures = data.response.filter(m => m.fixture.status.short === "NS")

    const results = data.response
      .filter(m => ["FT", "AET", "PEN"].includes(m.fixture.status.short))
      .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)

    const live = data.response.filter(m =>
      ["1H", "HT", "2H", "ET", "BT", "LIVE"].includes(m.fixture.status.short)
    )

    const payload = { fixtures, results, live }

    const ttl = season === CURRENT_SEASON ? CURRENT_CACHE_SECONDS : PAST_CACHE_SECONDS
    await redis.set(cacheKey, payload, { ex: ttl })

    console.log(payload)

    return Response.json({ success: true, data: payload })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })