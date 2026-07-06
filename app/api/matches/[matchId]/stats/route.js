import { redis } from "@/lib/redis"

export async function GET(request, { params }) {
  try {
    const { matchId } = await params
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "UPCOMING"

    if (status === "UPCOMING") {
      return Response.json({ success: true, data: null, message: "Match hasn't started yet" })
    }

    const cacheKey = `match:stats:${matchId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(`https://v3.football.api-sports.io/fixtures/statistics?fixture=${matchId}`, {
      headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
    })

    if (!res.ok) {
      return Response.json({ success: false, message: "Failed to fetch stats" }, { status: 502 })
    }

    const data = await res.json()

    // data.response is an array of 2 team stat blocks — reshape to { home: {...}, away: {...} }
    const [homeBlock, awayBlock] = data.response

    function toStatMap(block) {
      if (!block) return {}
      const map = {}
      for (const s of block.statistics) {
        map[s.type] = s.value
      }
      return map
    }

    const payload = {
      home: { team: homeBlock?.team, stats: toStatMap(homeBlock) },
      away: { team: awayBlock?.team, stats: toStatMap(awayBlock) },
    }

    const ttl = status === "LIVE" ? 30 : 60 * 60 * 24 * 30

    await redis.set(cacheKey, payload, { ex: ttl })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}
