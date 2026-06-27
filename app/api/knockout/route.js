import { redis } from "@/lib/redis"

const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const CURRENT_CACHE_SECONDS = 60 * 60 * 3

const KNOCKOUT_KEYWORDS = [
  "round of 32",
  "round of 16",
  "quarter-finals",
  "semi-finals",
  "3rd place final",
  "final",
]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get("league")
    const season = searchParams.get("season")

    if (!league || !season) {
      return Response.json(
        { success: false, message: "League and season are required" },
        { status: 400 }
      )
    }

    const cacheKey = `knockout:${league}:${season}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log(`[knockout] Redis hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached })
    }

    console.log(`[knockout] Redis miss — fetching ${cacheKey}`)

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch knockout fixtures" },
        { status: 502 }
      )
    }

    const data = await res.json()

    const roundMap = {}
    for (const match of data.response) {
      const round = match.league.round
      if (!roundMap[round]) roundMap[round] = []
      roundMap[round].push(match)
    }

    const rounds = Object.entries(roundMap)
      .filter(([round]) =>
        KNOCKOUT_KEYWORDS.some(kw =>
          round.toLowerCase().includes(kw)
        )
      )
      .map(([round, matches]) => ({ round, matches }))

    const ttl = season === CURRENT_SEASON
      ? CURRENT_CACHE_SECONDS
      : PAST_CACHE_SECONDS

    await redis.set(cacheKey, rounds, { ex: ttl })

    return Response.json({ success: true, data: rounds })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}