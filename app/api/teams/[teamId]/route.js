import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { withApiMonitoring } from "@/lib/apiMonitor";
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getHandler(request, { params }) {
  try {
    const { teamId } = await params

    const cacheKey = `team:info:${teamId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetchApiFootball(`/teams?id=${teamId}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
    })

    if (!res.ok) {
      return apiFootballErrorResponse(res, "Failed to fetch team")
    }

    const data = await res.data
    const team = data.response[0]

    if (!team) {
      return Response.json(
        { success: false, message: "Team not found" },
        { status: 404 }
      )
    }

    await redis.set(cacheKey, team, { ex: 60 * 60 * 24 * 30 }) // 30 days

    return Response.json({ success: true, data: team })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export const GET = withApiMonitoring(withRateLimit(getHandler, { limiter: "read" }));