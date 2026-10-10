import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getHandler(request, { params }) {
  try {
    const { teamId } = await params

    const cacheKey = `team:squad:${teamId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetchApiFootball(`/players/squads?team=${teamId}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY }
    })

    if (!res.ok) {
      return apiFootballErrorResponse(res, "Failed to fetch squad")
    }

    const data = await res.data
    const squad = data.response[0]?.players ?? []

    // Group by position
    const grouped = {
      Goalkeeper: squad.filter(p => p.position === "Goalkeeper"),
      Defender: squad.filter(p => p.position === "Defender"),
      Midfielder: squad.filter(p => p.position === "Midfielder"),
      Attacker: squad.filter(p => p.position === "Attacker"),
    }

    await redis.set(cacheKey, grouped, { ex: 60 * 60 * 24 }) // 24 hours

    return Response.json({ success: true, data: grouped })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })