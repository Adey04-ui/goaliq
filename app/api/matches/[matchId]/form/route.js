import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getTeamForm(teamId) {
  const cacheKey = `team:form:${teamId}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  const result = await fetchApiFootball(`/fixtures?team=${teamId}&last=5`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  })

  if (!result.ok) return []

  const data = result.data

  const form = data.response
    .sort((a, b) => a.fixture.timestamp - b.fixture.timestamp)
    .map((m) => {
      const isHome = m.teams.home.id === Number(teamId)
      const teamGoals = isHome ? m.goals.home : m.goals.away
      const oppGoals = isHome ? m.goals.away : m.goals.home
      const result = teamGoals > oppGoals ? "W" : teamGoals < oppGoals ? "L" : "D"
      return {
        result,
        opponent: isHome ? m.teams.away.name : m.teams.home.name,
        score: `${m.goals.home}-${m.goals.away}`,
        date: m.fixture.date,
      }
    })

  await redis.set(cacheKey, form, { ex: 60 * 60 * 6 })
  return form
}

async function getHandler(request, { params }) {
  try {
    const { searchParams } = new URL(request.url)
    const homeTeamId = searchParams.get("home")
    const awayTeamId = searchParams.get("away")

    if (!homeTeamId || !awayTeamId) {
      return Response.json({ success: false, message: "home and away team ids required" }, { status: 400 })
    }

    const [homeForm, awayForm] = await Promise.all([getTeamForm(homeTeamId), getTeamForm(awayTeamId)])

    return Response.json({ success: true, data: { home: homeForm, away: awayForm } })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })