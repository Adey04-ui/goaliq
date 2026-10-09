import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { withApiMonitoring } from "@/lib/apiMonitor";
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getHandler(request, { params }) {
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

    const result = await fetchApiFootball(`/standings?league=${league}&season=${season}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    })

    if (!result.ok) {
      return apiFootballErrorResponse(result, "Failed to fetch standings")
    }

    const data = await result.data

    // API-Football nests standings as response[0].league.standings[groupIndex][]
    // some leagues (e.g. cup groups) have multiple groups â€” flatten for simplicity, frontend can split by group if needed
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

export const GET = withApiMonitoring(withRateLimit(getHandler, { limiter: "read" }));