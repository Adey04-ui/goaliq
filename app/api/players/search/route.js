import { redis } from "@/lib/redis"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const team = searchParams.get("team")
    const season = searchParams.get("season") || new Date().getFullYear().toString()

    if (!query && !team) {
      return Response.json(
        { success: false, message: "Query or team required" },
        { status: 400 }
      )
    }

    const cacheKey = `players:${query || ""}:${team || ""}:${season}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      return Response.json({ success: true, data: cached })
    }

    // Build API URL
    const params = new URLSearchParams({ season })
    if (query) params.set("search", query)
    if (team) params.set("team", team)

    const res = await fetch(
      `https://v3.football.api-sports.io/players?${params.toString()}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch players" },
        { status: 502 }
      )
    }

    const data = await res.json()

    const players = data.response.map(p => ({
      id: p.player.id,
      name: p.player.name,
      photo: p.player.photo,
      nationality: p.player.nationality,
      position: p.statistics[0]?.games?.position ?? "Unknown",
      team: p.statistics[0]?.team?.name ?? "",
      teamLogo: p.statistics[0]?.team?.logo ?? "",
    }))

    // Cache for 24 hours — player data doesn't change often
    await redis.set(cacheKey, players, { ex: 60 * 60 * 24 })

    return Response.json({ success: true, data: players })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}