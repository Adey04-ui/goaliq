import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { teamId } = await params

    const cacheKey = `team:squad:${teamId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(
      `https://v3.football.api-sports.io/players/squads?team=${teamId}`,
      { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch squad" },
        { status: 502 }
      )
    }

    const data = await res.json()
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