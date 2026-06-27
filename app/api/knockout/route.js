const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_MS = 1000 * 60 * 60 * 24 * 30
const CURRENT_CACHE_MS = 1000 * 60 * 60 * 3

const knockoutCache = new Map()

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

    const cacheKey = `${league}_${season}`
    const now = Date.now()
    const cached = knockoutCache.get(cacheKey)
    const cacheDuration = season === CURRENT_SEASON ? CURRENT_CACHE_MS : PAST_CACHE_MS

    if (cached && now < cached.expiry) {
      console.log(`[knockout] Cache hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached.data })
    }

    // Fetch all fixtures for this league/season
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
      {
        headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
      }
    )

    const data = await res.json()

    // Group fixtures by round
    const roundMap = {}
    for (const match of data.response) {
      const round = match.league.round
      if (!roundMap[round]) roundMap[round] = []
      roundMap[round].push(match)
    }

    // Convert to array and filter to knockout rounds only
    const knockoutKeywords = [
      "Round of 16", "Quarter-finals",
      "Semi-finals", "Final",
      "Round of 32", "3rd Place Final"
    ]

    const rounds = Object.entries(roundMap)
      .filter(([round]) =>
        knockoutKeywords.some((kw) =>
          round.toLowerCase().includes(kw.toLowerCase())
        )
      )
      .map(([round, matches]) => ({ round, matches }))

    knockoutCache.set(cacheKey, {
      data: rounds,
      expiry: now + cacheDuration,
    })

    return Response.json({ success: true, data: rounds })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}