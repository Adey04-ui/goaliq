import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { matchId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "UPCOMING"

    if (status === "UPCOMING") {
      return Response.json({ success: true, data: null, message: "Lineups not yet announced" })
    }

    const cacheKey = `match:lineups:${matchId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const [lineupsRes, playersStatsRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/fixtures/lineups?fixture=${matchId}`, {
        headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
      }),
      fetch(`https://v3.football.api-sports.io/fixtures/players?fixture=${matchId}`, {
        headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
      }),
    ])

    if (!lineupsRes.ok) {
      return Response.json({ success: false, message: "Failed to fetch lineups" }, { status: 502 })
    }

    const data = await lineupsRes.json()

    if (!data.response.length) {
      return Response.json({ success: true, data: null, message: "Lineups not yet announced" })
    }

    // build a lookup of playerId -> { rating, goals, assists, yellowCards, redCards }
    // from /fixtures/players, which is the only endpoint that carries per-match ratings
    const statsById = {}
    if (playersStatsRes.ok) {
      const playersData = await playersStatsRes.json()
      for (const teamBlock of playersData.response) {
        for (const p of teamBlock.players) {
          const s = p.statistics[0]
          if (!s) continue
          statsById[p.player.id] = {
            rating: s.games.rating ? Number(s.games.rating) : null,
            goals: s.goals.total || 0,
            assists: s.goals.assists || 0,
            yellowCards: s.cards.yellow || 0,
            redCards: s.cards.red || 0,
          }
        }
      }
    }

    function withStats(p) {
      const stats = statsById[p.player.id] || {}
      return {
        id: p.player.id,
        name: p.player.name,
        number: p.player.number,
        position: p.player.pos,
        grid: p.player.grid,
        photo: `https://media.api-sports.io/football/players/${p.player.id}.png`,
        rating: stats.rating ?? null,
        goals: stats.goals ?? 0,
        assists: stats.assists ?? 0,
        yellowCards: stats.yellowCards ?? 0,
        redCards: stats.redCards ?? 0,
      }
    }

    const payload = data.response.map((side) => ({
      team: { id: side.team.id, name: side.team.name, logo: side.team.logo },
      formation: side.formation,
      startXI: side.startXI.map(withStats),
      substitutes: side.substitutes.map(withStats),
      coach: side.coach?.name || null,
    }))

    const ttl = status === "LIVE" ? 120 : 60 * 60 * 24 * 30

    await redis.set(cacheKey, payload, { ex: ttl })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}