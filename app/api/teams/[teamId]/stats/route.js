import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
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

    const res = await fetch(
      `https://v3.football.api-sports.io/teams/statistics?team=${teamId}&league=${league}&season=${season}`,
      { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch stats" },
        { status: 502 }
      )
    }

    const data = await res.json()

    await redis.set(cacheKey, data.response, { ex: 60 * 60 * 24 })

    return Response.json({ success: true, data: data.response })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}