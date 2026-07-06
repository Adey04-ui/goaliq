import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { matchId } = await params

    const cacheKey = `match:odds:${matchId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const [oddsRes, predictionsRes] = await Promise.all([
      fetch(`https://v3.football.api-sports.io/odds?fixture=${matchId}`, {
        headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
      }),
      fetch(`https://v3.football.api-sports.io/predictions?fixture=${matchId}`, {
        headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
      }),
    ])

    const oddsData = oddsRes.ok ? await oddsRes.json() : { response: [] }
    const predictionsData = predictionsRes.ok ? await predictionsRes.json() : { response: [] }

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

    // odds shift as kickoff approaches, but not worth refreshing more than hourly
    await redis.set(cacheKey, payload, { ex: 60 * 60 })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}
