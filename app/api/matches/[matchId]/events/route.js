import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getHandler(request, { params }) {
  try {
    const { matchId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "UPCOMING"

    if (!/^\d+$/.test(matchId)) {
      return Response.json(
        { success: false, message: "Invalid match id" },
        { status: 400 }
      )
    }

    if (status === "UPCOMING") {
      return Response.json({ success: true, data: [] })
    }

    const cacheKey = `match:events:${matchId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    // Path only. Name the variable `result`: it is NOT a fetch Response.
    const result = await fetchApiFootball(`/fixtures/events?fixture=${matchId}`)

    if (!result.ok) {
      return apiFootballErrorResponse(result, "Failed to fetch events")
    }

    const events = result.data.response.map((e) => ({
      time: e.time.elapsed,
      extraTime: e.time.extra,
      type: e.type, // "Goal" | "Card" | "subst" | "Var"
      detail: e.detail,
      team: { id: e.team.id, name: e.team.name, logo: e.team.logo },
      player: e.player?.name || null,
      assist: e.assist?.name || null,
      comments: e.comments || null,
    }))

    // NOTE: `status` comes from the client. A wrong value (e.g. "FINISHED" for
    // a live match) would cache partial events for 30 days. Safer long-term:
    // derive the status server-side from the fixture itself.
    const ttl = status === "LIVE" ? 30 : 60 * 60 * 24 * 30

    await redis.set(cacheKey, events, { ex: ttl })

    return Response.json({ success: true, data: events })
  } catch (error) {
    console.error("[match events] error:", error)
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })