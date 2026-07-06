import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { matchId } = await params
    const { searchParams } = new URL(request.url)
    const homeTeamId = searchParams.get("home")
    const awayTeamId = searchParams.get("away")

    if (!homeTeamId || !awayTeamId) {
      return Response.json({ success: false, message: "home and away team ids required" }, { status: 400 })
    }

    const cacheKey = `match:h2h:${homeTeamId}:${awayTeamId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures/headtohead?h2h=${homeTeamId}-${awayTeamId}&last=10`,
      { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
    )

    if (!res.ok) {
      return Response.json({ success: false, message: "Failed to fetch head-to-head" }, { status: 502 })
    }

    const data = await res.json()

    const meetings = data.response
      .filter((m) => m.fixture.status.short === "FT" || m.fixture.status.short === "AET" || m.fixture.status.short === "PEN")
      .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)
      .map((m) => ({
        id: m.fixture.id,
        date: m.fixture.date,
        league: m.league.name,
        teams: {
          home: { id: m.teams.home.id, name: m.teams.home.name, logo: m.teams.home.logo },
          away: { id: m.teams.away.id, name: m.teams.away.name, logo: m.teams.away.logo },
        },
        goals: { home: m.goals.home, away: m.goals.away },
      }))

    // tally record from the requested home team's perspective
    let homeWins = 0,
      awayWins = 0,
      draws = 0
    for (const m of meetings) {
      if (m.goals.home === m.goals.away) {
        draws++
        continue
      }
      const winnerId = m.goals.home > m.goals.away ? m.teams.home.id : m.teams.away.id
      if (String(winnerId) === String(homeTeamId)) homeWins++
      else awayWins++
    }

    const payload = { meetings, record: { homeWins, awayWins, draws } }

    // H2H history rarely changes day-to-day — long cache is fine
    await redis.set(cacheKey, payload, { ex: 60 * 60 * 24 * 7 })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}
