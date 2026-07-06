import { redis } from "@/lib/redis"
import { mapStatus } from "@/lib/matchStatus"

export async function GET(request, { params }) {
  try {
    const { matchId } = await params

    const cacheKey = `match:core:${matchId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(`https://v3.football.api-sports.io/fixtures?id=${matchId}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    })

    if (!res.ok) {
      return Response.json({ success: false, message: "Failed to fetch match" }, { status: 502 })
    }

    const data = await res.json()
    const m = data.response[0]

    if (!m) {
      return Response.json({ success: false, message: "Match not found" }, { status: 404 })
    }

    const status = mapStatus(m.fixture.status.short)

    const payload = {
      id: m.fixture.id,
      date: m.fixture.date,
      timestamp: m.fixture.timestamp,
      status,
      statusShort: m.fixture.status.short,
      elapsed: m.fixture.status.elapsed,
      venue: { name: m.fixture.venue?.name || null, city: m.fixture.venue?.city || null },
      referee: m.fixture.referee || null,
      league: {
        id: m.league.id,
        name: m.league.name,
        country: m.league.country,
        logo: m.league.logo,
        season: m.league.season,
        round: m.league.round,
      },
      teams: {
        home: { id: m.teams.home.id, name: m.teams.home.name, logo: m.teams.home.logo, winner: m.teams.home.winner },
        away: { id: m.teams.away.id, name: m.teams.away.name, logo: m.teams.away.logo, winner: m.teams.away.winner },
      },
      goals: { home: m.goals.home, away: m.goals.away },
      score: m.score,
    }

    // LIVE matches refresh fast, FINISHED never changes, UPCOMING can shift (postponements) so medium TTL
    const ttl = status === "LIVE" ? 30 : status === "FINISHED" ? 60 * 60 * 24 * 30 : 60 * 15

    await redis.set(cacheKey, payload, { ex: ttl })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}
