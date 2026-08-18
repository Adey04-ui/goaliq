import { prisma } from "@/lib/prisma"
import { redis } from "@/lib/redis"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { NextResponse } from "next/server"

const SEARCH_CACHE_TTL = 60 * 60 * 24 // team/league names essentially never change — cache a full day

async function fetchApiFootball(endpoint) {
  const res = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  })

  if (!res.ok) {
    console.error(`Search request failed: ${endpoint} (${res.status})`)
    return []
  }

  const json = await res.json()

  // same blind spot the indexing script had — API-Football often returns HTTP 200
  // with an empty response AND an explanatory `errors` object. Surface it instead
  // of silently returning [] and looking identical to "genuinely no results."
  if (json.errors && Object.keys(json.errors).length > 0) {
    console.error(`Search API errors for ${endpoint}:`, json.errors)
  }

  return json.response || []
}

// cached wrapper — only hits API-Football on a genuine cache miss
async function cachedFetch(cacheKey, endpoint) {
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  const result = await fetchApiFootball(endpoint)
  await redis.set(cacheKey, result, { ex: SEARCH_CACHE_TTL })
  return result
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get("q")?.trim()

  if (!q || q.length < 2) {
    return NextResponse.json({ players: [], teams: [], leagues: [] })
  }

  const qKey = q.toLowerCase()

  // 1. Players — PlayerIndex first (fast, zero API cost, populated via scripts/index-players.mjs)
  let players = await prisma.playerIndex.findMany({
    where: { name: { contains: q, mode: "insensitive" } },
    take: 5,
    orderBy: { name: "asc" },
  })

  // 2. Fallback ONLY if PlayerIndex misses — scoped to the signed-in user's own
  // favorited teams, since /players?search= requires team or league on our plan.
  // NOT cached — this is inherently per-user (depends on who's favorited what),
  // so caching it wouldn't save meaningful quota the way the shared team/league
  // caches below do.
  if (players.length === 0) {
    const session = await getServerSession(authOptions)

    if (session?.user?.email) {
      const user = await prisma.user.findUnique({ where: { email: session.user.email } })

      if (user) {
        const favoriteTeams = await prisma.favorite.findMany({
          where: { userId: user.id, type: "TEAM" },
          select: { itemId: true },
          take: 3, // capped low — this path is uncached and costs real daily quota per call
        })

        const teamResults = await Promise.all(
          favoriteTeams.map((f) => fetchApiFootball(`/players?team=${f.itemId}&search=${encodeURIComponent(q)}`))
        )

        players = teamResults
          .flat()
          .slice(0, 5)
          .map((r) => ({
            id: r.player.id,
            name: r.player.name,
            photo: r.player.photo,
            position: r.statistics?.[0]?.games?.position || r.player.position,
            teamName: r.statistics?.[0]?.team?.name || null,
          }))
      }
    }
  }

  // 3. Teams — cached per query string, shared across every user who searches the same term
  const teamResults = await cachedFetch(`search:teams:${qKey}`, `/teams?search=${encodeURIComponent(q)}`)
  const teams = teamResults.slice(0, 5).map((r) => ({
    id: r.team.id,
    name: r.team.name,
    logo: r.team.logo,
    country: r.team.country,
  }))

  // 4. Leagues — same caching approach
  const leagueResults = await cachedFetch(`search:leagues:${qKey}`, `/leagues?search=${encodeURIComponent(q)}`)
  const leagues = leagueResults.slice(0, 5).map((r) => ({
    id: r.league.id,
    name: r.league.name,
    logo: r.league.logo,
    country: r.country.name,
  }))

  return NextResponse.json({ players, teams, leagues })
}