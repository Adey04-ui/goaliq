import { redis } from "@/lib/redis"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 2) {
      return Response.json({ success: false, message: "Query required" }, { status: 400 })
    }

    const cacheKey = `teams:search:${query.toLowerCase()}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const res = await fetch(
      `https://v3.football.api-sports.io/teams?search=${encodeURIComponent(query)}`,
      { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
    )

    const data = await res.json()

    const teams = data.response.map(t => ({
      id: t.team.id,
      name: t.team.name,
      logo: t.team.logo,
      country: t.team.country,
    }))

    await redis.set(cacheKey, teams, { ex: 60 * 60 * 24 * 7 })

    return Response.json({ success: true, data: teams })

  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}