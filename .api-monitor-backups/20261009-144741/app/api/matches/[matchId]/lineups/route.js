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
      return Response.json({ success: true, data: null, message: "Lineups not yet announced" })
    }

    const cacheKey = `match:lineups:${matchId}`
    const emptyKey = `match:lineups:empty:${matchId}`

    const [cached, knownEmpty] = await Promise.all([
      redis.get(cacheKey),
      redis.get(emptyKey),
    ])
    if (cached) return Response.json({ success: true, data: cached })
    if (knownEmpty) {
      return Response.json({ success: true, data: null, message: "Lineups not yet announced" })
    }

    // 1) Lineups first. If they aren't announced there is no point spending a
    //    second API-Football call on player stats.
    const lineupsRes = await fetchApiFootball(`/fixtures/lineups?fixture=${matchId}`)

    if (!lineupsRes.ok) {
      return apiFootballErrorResponse(lineupsRes, "Failed to fetch lineups")
    }

    if (!lineupsRes.data.response.length) {
      // Remember "not announced" briefly, so repeated requests don't each
      // spend budget just to hear the same answer.
      await redis.set(emptyKey, 1, { ex: 60 })
      return Response.json({ success: true, data: null, message: "Lineups not yet announced" })
    }

    // 2) Player stats (ratings etc.)
    const playersStatsRes = await fetchApiFootball(`/fixtures/players?fixture=${matchId}`)

    // build a lookup of playerId -> { rating, goals, assists, yellowCards, redCards }
    // from /fixtures/players, which is the only endpoint that carries per-match ratings
    const statsById = {}
    if (playersStatsRes.ok) {
      // The parsed body is in .data (a result object has no .json()).
      for (const teamBlock of playersStatsRes.data.response) {
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

    const payload = lineupsRes.data.response.map((side) => ({
      team: { id: side.team.id, name: side.team.name, logo: side.team.logo },
      formation: side.formation,
      startXI: side.startXI.map(withStats),
      substitutes: side.substitutes.map(withStats),
      coach: side.coach?.name || null,
    }))

    // If the stats call failed, ratings are missing. Don't lock that in for
    // 30 days: cache briefly so the next request retries the stats.
    // NOTE: `status` comes from the client; deriving it server-side (like the
    // match-core route does) would be safer.
    const ttl = !playersStatsRes.ok
      ? 60
      : status === "LIVE"
        ? 120
        : 60 * 60 * 24 * 30

    await redis.set(cacheKey, payload, { ex: ttl })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    console.error("[match lineups] error:", error)
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })