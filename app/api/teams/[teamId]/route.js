import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { teamId } = await params

    const cacheKey = `team:info:${teamId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(
      `https://v3.football.api-sports.io/teams?id=${teamId}`,
      { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch team" },
        { status: 502 }
      )
    }

    const data = await res.json()
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