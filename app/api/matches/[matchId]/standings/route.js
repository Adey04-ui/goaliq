import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { matchId } = await params
    const { searchParams } = new URL(request.url)
    const league = searchParams.get("league")
    const season = searchParams.get("season")

    if (!league || !season) {
      return Response.json({ success: false, message: "league and season required" }, { status: 400 })
    }

    const cacheKey = `match:standings:${league}:${season}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(`https://v3.football.api-sports.io/standings?league=${league}&season=${season}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    })

    if (!res.ok) {
      return Response.json({ success: false, message: "Failed to fetch standings" }, { status: 502 })
    }

    const data = await res.json()

    // API-Football nests standings as response[0].league.standings[groupIndex][]
    // some leagues (e.g. cup groups) have multiple groups — flatten for simplicity, frontend can split by group if needed
    const groups = data.response[0]?.league?.standings || []

    const payload = groups.map((group) =>
      group.map((row) => ({
        rank: row.rank,
        team: { id: row.team.id, name: row.team.name, logo: row.team.logo },
        points: row.points,
        played: row.all.played,
        win: row.all.win,
        draw: row.all.draw,
        lose: row.all.lose,
        goalsDiff: row.goalsDiff,
        form: row.form,
      }))
    )

    await redis.set(cacheKey, payload, { ex: 60 * 60 * 6 })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}
