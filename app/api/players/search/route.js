import { redis } from "@/lib/redis"

// app/api/players/search/route.js

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")
    const team = searchParams.get("team")
    const season = searchParams.get("season") || new Date().getFullYear().toString()

    if (!query && !team) {
      return Response.json(
        { success: false, message: "Query or team required" },
        { status: 400 }
      )
    }

    // Top leagues to search across when no team is specified
    const TOP_LEAGUES = [39, 140, 135, 78, 61, 2, 3]

    let allPlayers = []

    if (team) {
      // Browse by team — single request
      const cacheKey = `players:team:${team}:${season}`
      const cached = await redis.get(cacheKey)
      if (cached) return Response.json({ success: true, data: cached })

      const res = await fetch(
        `https://v3.football.api-sports.io/players?team=${team}&season=${season}`,
        { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
      )
      const data = await res.json()
      allPlayers = data.response

      // API paginates — fetch remaining pages if any
      const totalPages = data.paging?.total ?? 1
      for (let page = 2; page <= totalPages; page++) {
        const pageRes = await fetch(
          `https://v3.football.api-sports.io/players?team=${team}&season=${season}&page=${page}`,
          { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
        )
        const pageData = await pageRes.json()
        allPlayers = [...allPlayers, ...pageData.response]
      }

      const players = mapPlayers(allPlayers)
      await redis.set(cacheKey, players, { ex: 60 * 60 * 24 })
      return Response.json({ success: true, data: players, debug: {
          query,
          season,
          leaguesSearched: TOP_LEAGUES,
          resultsPerLeague: results.map((r, i) => ({
            league: TOP_LEAGUES[i],
            count: r.results,
            errors: r.errors,
            parameters: r.parameters,
          })),
          totalFound: players.length,
        } })

    } else {
      // Search by name — must include a league
      // Search across top leagues in parallel
      const cacheKey = `players:search:${query}:${season}`
      const cached = await redis.get(cacheKey)
      if (cached) return Response.json({ success: true, data: cached })

      const results = await Promise.all(
        TOP_LEAGUES.map(leagueId =>
          fetch(
            `https://v3.football.api-sports.io/players?search=${encodeURIComponent(query)}&league=${leagueId}&season=${season}`,
            { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
          ).then(r => r.json())
        )
      )

      // Merge and dedupe by player id
      const seen = new Set()
      for (const result of results) {
        for (const item of result.response) {
          if (!seen.has(item.player.id)) {
            seen.add(item.player.id)
            allPlayers.push(item)
          }
        }
      }

      const players = mapPlayers(allPlayers)
      await redis.set(cacheKey, players, { ex: 60 * 60 * 24 })
      return Response.json({
        success: true, data: players, debug: {
          query,
          season,
          leaguesSearched: TOP_LEAGUES,
          resultsPerLeague: results.map((r, i) => ({
            league: TOP_LEAGUES[i],
            count: r.results,
            errors: r.errors,
            parameters: r.parameters,
          })),
          totalFound: players.length,
        }
      })
    }

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

function mapPlayers(response) {
  return response.map(p => ({
    id: p.player.id,
    name: p.player.name,
    photo: p.player.photo,
    nationality: p.player.nationality,
    position: p.statistics[0]?.games?.position ?? "Unknown",
    team: p.statistics[0]?.team?.name ?? "",
    teamLogo: p.statistics[0]?.team?.logo ?? "",
  }))
}