import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { withApiMonitoring } from "@/lib/apiMonitor";
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getHandler(request, { params }) {
  try {
    const { teamId } = await params
    const { searchParams } = new URL(request.url)
    const league = searchParams.get("league")
    const season = searchParams.get("season") || new Date().getFullYear().toString()

    if (!league) {
      return Response.json(
        { success: false, message: "League required" },
        { status: 400 }
      )
    }

    const cacheKey = `team:stats:${teamId}:${league}:${season}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetchApiFootball(`/teams/statistics?team=${teamId}&league=${league}&season=${season}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
    })

    if (!res.ok) {
      return apiFootballErrorResponse(res, "Failed to fetch stats")
    }

    const data = await res.data

    await redis.set(cacheKey, data.response, { ex: 60 * 60 * 24 })

    return Response.json({ success: true, data: data.response })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export const GET = withApiMonitoring(withRateLimit(getHandler, { limiter: "read" }));