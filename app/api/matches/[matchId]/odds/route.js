import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"
import { withApiMonitoring } from "@/lib/apiMonitor";
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getHandler(request, { params }) {
  try {
    const { matchId } = await params

    // Numbers only: keeps junk out of the cache key and the API-Football query.
    if (!/^\d+$/.test(matchId)) {
      return Response.json(
        { success: false, message: "Invalid match id" },
        { status: 400 }
      )
    }

    const cacheKey = `match:odds:${matchId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    // Paths only: the helper adds the base URL and the API key.
    const [oddsRes, predictionsRes] = await Promise.all([
      fetchApiFootball(`/odds?fixture=${matchId}`),
      fetchApiFootball(`/predictions?fixture=${matchId}`),
    ])

    const failed = [oddsRes, predictionsRes].filter((r) => !r.ok)

    // Both failed: there is nothing to show. Prefer the failure that carries
    // a retryAfter (budget used up) so the client gets a proper Retry-After.
    if (failed.length === 2) {
      return apiFootballErrorResponse(
        failed.find((r) => r.retryAfter) ?? failed[0],
        "Failed to fetch odds and predictions"
      )
    }

    // One failed: still return the half we have. This is different from
    // "the API has no odds for this match", which is ok:true with an empty
    // response and is cached normally.
    const oddsData = oddsRes.ok ? oddsRes.data : { response: [] }
    const predictionsData = predictionsRes.ok ? predictionsRes.data : { response: [] }

    // odds: pick the first bookmaker's match-winner market as a simple default
    const bookmaker = oddsData.response[0]?.bookmakers?.[0]
    const matchWinnerMarket = bookmaker?.bets?.find((b) => b.name === "Match Winner")

    const prediction = predictionsData.response[0]

    const payload = {
      odds: matchWinnerMarket
        ? {
            bookmaker: bookmaker.name,
            values: matchWinnerMarket.values, // [{ value: "Home"|"Draw"|"Away", odd: "1.85" }]
          }
        : null,
      prediction: prediction
        ? {
            winner: prediction.predictions.winner, // { id, name, comment }
            homeWinPercent: prediction.predictions.percent.home,
            drawPercent: prediction.predictions.percent.draw,
            awayWinPercent: prediction.predictions.percent.away,
            advice: prediction.predictions.advice,
          }
        : null,
    }

    // Full result: cache for an hour. Partial result: cache briefly, so the
    // missing half is retried soon without every request re-spending budget.
    const ttl = failed.length === 0 ? 60 * 60 : 60
    await redis.set(cacheKey, payload, { ex: ttl })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    console.error("[match odds] error:", error)
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export const GET = withApiMonitoring(withRateLimit(getHandler, { limiter: "read" }));