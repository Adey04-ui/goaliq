import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import {
  fetchApiFootball,
  apiFootballErrorResponse,
  routeErrorResponse,
} from "@/lib/apiFootball"
import { withApiMonitoring } from "@/lib/apiMonitor";

const CURRENT_SEASON = new Date().getFullYear().toString()

const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const CURRENT_CACHE_SECONDS = 60 * 60 * 3

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url)

    const league = searchParams.get("league")
    const season = searchParams.get("season")

    if (!league || !season) {
      return Response.json(
        {
          success: false,
          message: "League and season are required",
        },
        { status: 400 }
      )
    }

    // Only plain numbers, so junk values can't create endless cache misses.
    if (!/^\d+$/.test(league) || !/^\d{4}$/.test(season)) {
      return Response.json(
        {
          success: false,
          message: "Invalid league or season",
        },
        { status: 400 }
      )
    }

    const cacheKey = `fixtures:${league}:${season}`

    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log(`[fixtures] Redis hit — ${cacheKey}`)

      return Response.json({
        success: true,
        data: cached,
      })
    }

    console.log(`[fixtures] Redis miss — fetching ${cacheKey}`)

    const result = await fetchApiFootball(
      `/fixtures?league=${league}&season=${season}`
    )

    if (!result.ok) {
      return apiFootballErrorResponse(
        result,
        "Failed to fetch fixtures"
      )
    }

    const all = result.data.response

    const fixtures = all.filter(
      (match) => match.fixture.status.short === "NS"
    )

    const results = all
      .filter((match) =>
        ["FT", "AET", "PEN"].includes(
          match.fixture.status.short
        )
      )
      .sort(
        (a, b) =>
          b.fixture.timestamp - a.fixture.timestamp
      )

    const live = all.filter((match) =>
      ["1H", "HT", "2H", "ET", "BT", "LIVE"].includes(
        match.fixture.status.short
      )
    )

    const payload = {
      fixtures,
      results,
      live,
    }

    const ttl =
      season === CURRENT_SEASON
        ? CURRENT_CACHE_SECONDS
        : PAST_CACHE_SECONDS

    await redis.set(cacheKey, payload, {
      ex: ttl,
    })

    return Response.json({
      success: true,
      data: payload,
    })
  } catch (error) {
    return routeErrorResponse(error, "fixtures")
  }
}

export const GET = withApiMonitoring(
  withRateLimit(getHandler, {
    limiter: "read",
  })
)