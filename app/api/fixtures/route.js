// In your fixtures route.js

const CURRENT_SEASON = new Date().getFullYear().toString()
const PAST_CACHE_MS = 1000 * 60 * 60 * 24 * 30 
const CURRENT_CACHE_MS = 1000 * 60 * 60 * 3  

// Simple in-memory cache (same pattern as leagues)
const fixturesCache = new Map()

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
    const cached = fixturesCache.get(cacheKey)
    const cacheDuration = season === CURRENT_SEASON ? CURRENT_CACHE_MS : PAST_CACHE_MS

    // Serve from memory if still fresh
    if (cached && now < cached.expiry) {
      console.log(`[fixtures] Cache hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached.data })
    }

    console.log(`[fixtures] Cache miss — fetching ${cacheKey}`)

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    )

    const data = await res.json()

    const fixtures = data.response.filter(
      (m) => m.fixture.status.short === "NS"
    )

    const results = data.response
      .filter((m) => ["FT", "AET", "PEN"].includes(m.fixture.status.short))
      .sort((a, b) => b.fixture.timestamp - a.fixture.timestamp)

    const live = data.response.filter((m) =>
      ["1H", "HT", "2H", "ET", "BT", "LIVE"].includes(m.fixture.status.short)
    )

    const payload = { fixtures, results, live }

    // Store in memory with expiry
    fixturesCache.set(cacheKey, {
      data: payload,
      expiry: now + cacheDuration,
    })

    return Response.json({ success: true, data: payload })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}