// app/api/topScorers/route.js

const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_MS = 1000 * 60 * 60 * 24 * 30  // 30 days
const CURRENT_CACHE_MS = 1000 * 60 * 60 * 3      // 3 hours

const topScorersCache = new Map()

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
    const cached = topScorersCache.get(cacheKey)
    const cacheDuration = season === CURRENT_SEASON ? CURRENT_CACHE_MS : PAST_CACHE_MS

    if (cached && now < cached.expiry) {
      console.log(`[topScorers] Cache hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached.data })
    }

    console.log(`[topScorers] Cache miss — fetching ${cacheKey}`)

    const res = await fetch(
      `https://v3.football.api-sports.io/players/topscorers?league=${league}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch top scorers" },
        { status: 502 }
      )
    }

    const data = await res.json()
    const scorers = data.response

    topScorersCache.set(cacheKey, {
      data: scorers,
      expiry: now + cacheDuration,
    })

    return Response.json({ success: true, data: scorers })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}