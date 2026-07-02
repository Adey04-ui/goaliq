import { redis } from "@/lib/redis"

const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const CURRENT_CACHE_SECONDS = 60 * 60 * 3

export async function GET(request, { params }) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const season = searchParams.get("season") || CURRENT_SEASON

    const cacheKey = `team:fixtures:${teamId}:${season}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=${season}`,
      { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch fixtures" },
        { status: 502 }
      )
    }

    const data = await res.json()

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

    return Response.json({ success: true, data: payload })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}