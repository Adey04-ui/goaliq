import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { fetchLocalDayFixtures, todayString } from "@/lib/fixtures"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

const TRENDING_CACHE_SECONDS = 60 * 60
const LEAGUES_PER_PAGE = 8

async function getCurrentUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

async function getTrendingLeagueIds() {
  const cacheKey = "trending:leagues"
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  const grouped = await prisma.favorite.groupBy({
    by: ["itemId"],
    where: { type: "LEAGUE" },
    _count: { itemId: true },
    orderBy: { _count: { itemId: "desc" } },
    take: 10,
  })

  const ids = grouped.map((g) => g.itemId)
  await redis.set(cacheKey, ids, { ex: TRENDING_CACHE_SECONDS })
  return ids
}

async function getUserFavourites(userId) {
  if (!userId) return { leagues: new Set(), teams: new Set(), matches: new Set() }

  const rows = await prisma.favorite.findMany({
    where: { userId },
    select: { itemId: true, type: true },
  })

  return {
    leagues: new Set(rows.filter((r) => r.type === "LEAGUE").map((r) => String(r.itemId))),
    teams: new Set(rows.filter((r) => r.type === "TEAM").map((r) => String(r.itemId))),
    matches: new Set(rows.filter((r) => r.type === "MATCH").map((r) => String(r.itemId))),
  }
}

function filterByFavourites(leagues, favourites) {
  const filtered = {}
  for (const [id, group] of Object.entries(leagues)) {
    const matches = group.matches.filter((m) => {
      return (
        favourites.leagues.has(String(m.league.id)) ||
        favourites.teams.has(String(m.teams.home.id)) ||
        favourites.teams.has(String(m.teams.away.id)) ||
        favourites.matches.has(String(m.id))
      )
    })
    if (matches.length > 0) filtered[id] = { league: group.league, matches }
  }
  return filtered
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || todayString()
    const page = parseInt(searchParams.get("page") || "1", 10)
    const leagueFilter = searchParams.get("filter") || "all"
    const status = searchParams.get("status") || "all"
    const timeZone = searchParams.get("tz") || "UTC"

    const userId = await getCurrentUserId(request)
    const userFavs = await getUserFavourites(userId)

    const leagues = await fetchLocalDayFixtures(date, timeZone)

    let filteredLeagues = leagues

    if (status !== "all") {
      const temp = {}
      for (const id of Object.keys(filteredLeagues)) {
        const group = filteredLeagues[id]
        const matches = group.matches.filter((m) => m.status.toLowerCase() === status)
        if (matches.length > 0) temp[id] = { league: group.league, matches }
      }
      filteredLeagues = temp
    }

    if (leagueFilter === "favourites") {
      filteredLeagues = filterByFavourites(filteredLeagues, userFavs)
    }

    const trendingIds = await getTrendingLeagueIds()
    let leagueIds = Object.keys(filteredLeagues)

    if (leagueFilter === "trending") {
      leagueIds = leagueIds.filter((id) => trendingIds.includes(Number(id)))
    }

    leagueIds.sort((a, b) => {
      const aTrending = trendingIds.includes(Number(a))
      const bTrending = trendingIds.includes(Number(b))
      if (aTrending !== bTrending) return aTrending ? -1 : 1
      return filteredLeagues[a].league.name.localeCompare(filteredLeagues[b].league.name)
    })

    const totalLeagues = leagueIds.length
    const totalPages = Math.max(1, Math.ceil(totalLeagues / LEAGUES_PER_PAGE))
    const start = (page - 1) * LEAGUES_PER_PAGE
    const pageIds = leagueIds.slice(start, start + LEAGUES_PER_PAGE)

    return Response.json({
      success: true,
      data: {
        date,
        page,
        totalPages,
        totalLeagues,
        trendingLeagueIds: trendingIds,
        leagues: pageIds.map((id) => filteredLeagues[id]),
      },
    })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}