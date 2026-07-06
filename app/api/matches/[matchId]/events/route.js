import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { matchId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "UPCOMING"

    if (status === "UPCOMING") {
      return Response.json({ success: true, data: [] })
    }

    const cacheKey = `match:events:${matchId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(`https://v3.football.api-sports.io/fixtures/events?fixture=${matchId}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    })

    if (!res.ok) {
      return Response.json({ success: false, message: "Failed to fetch events" }, { status: 502 })
    }

    const data = await res.json()

    const events = data.response.map((e) => ({
      time: e.time.elapsed,
      extraTime: e.time.extra,
      type: e.type, // "Goal" | "Card" | "subst" | "Var"
      detail: e.detail,
      team: { id: e.team.id, name: e.team.name, logo: e.team.logo },
      player: e.player?.name || null,
      assist: e.assist?.name || null,
      comments: e.comments || null,
    }))

    const ttl = status === "LIVE" ? 30 : 60 * 60 * 24 * 30

    await redis.set(cacheKey, events, { ex: ttl })

    return Response.json({ success: true, data: events })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}
