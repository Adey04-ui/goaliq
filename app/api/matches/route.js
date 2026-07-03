import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"

const TODAY_CACHE_SECONDS = 45
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const FUTURE_CACHE_SECONDS = 60 * 60
const TRENDING_CACHE_SECONDS = 60 * 60
const LEAGUES_PER_PAGE = 6

const STATUS_MAP = {
  TBD: "UPCOMING",
  NS: "UPCOMING",
  "1H": "LIVE",
  HT: "LIVE",
  "2H": "LIVE",
  ET: "LIVE",
  BT: "LIVE",
  P: "LIVE",
  SUSP: "LIVE",
  INT: "LIVE",
  LIVE: "LIVE",
  FT: "FINISHED",
  AET: "FINISHED",
  PEN: "FINISHED",
  PST: "POSTPONED",
  CANC: "CANCELLED",
  ABD: "CANCELLED",
  AWD: "CANCELLED",
  WO: "CANCELLED",
}

function mapStatus(short) {
  return STATUS_MAP[short] || "UPCOMING"
}

function todayString() {
  return new Date().toISOString().slice(0, 10)
}

function getCacheTTL(date) {
  const today = todayString()
  if (date === today) return TODAY_CACHE_SECONDS
  if (date < today) return PAST_CACHE_SECONDS
  return FUTURE_CACHE_SECONDS
}

function normalizeFixture(m) {
  return {
    id: m.fixture.id,
    date: m.fixture.date,
    timestamp: m.fixture.timestamp,
    status: mapStatus(m.fixture.status.short),
    statusShort: m.fixture.status.short,
    elapsed: m.fixture.status.elapsed,
    venue: m.fixture.venue?.name || null,
    league: {
      id: m.league.id,
      name: m.league.name,
      country: m.league.country,
      logo: m.league.logo,
      round: m.league.round,
    },
    teams: {
      home: {
        id: m.teams.home.id,
        name: m.teams.home.name,
        logo: m.teams.home.logo,
        winner: m.teams.home.winner,
      },
      away: {
        id: m.teams.away.id,
        name: m.teams.away.name,
        logo: m.teams.away.logo,
        winner: m.teams.away.winner,
      },
    },
    goals: {
      home: m.goals.home,
      away: m.goals.away,
    },
  }
}

function groupByLeague(fixtures) {
  const groups = {}
  for (const f of fixtures) {
    const key = f.league.id
    if (!groups[key]) groups[key] = { league: f.league, matches: [] }
    groups[key].matches.push(f)
  }
  for (const key of Object.keys(groups)) {
    groups[key].matches.sort((a, b) => a.timestamp - b.timestamp)
  }
  return groups
}

async function fetchDayFixtures(date) {
  const cacheKey = `matches:${date}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  const res = await fetch(
    `https://v3.football.api-sports.io/fixtures?date=${date}`,
    { headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY } }
  )

  if (!res.ok) {
    throw new Error("Failed to fetch fixtures from API-Football")
  }

  const data = await res.json()
  const normalized = data.response.map(normalizeFixture)
  const grouped = groupByLeague(normalized)

  const payload = { date, leagues: grouped }

  await redis.set(cacheKey, payload, { ex: getCacheTTL(date) })

  return payload
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

  console.log("trending league ids:", ids)

  await redis.set(cacheKey, ids, { ex: TRENDING_CACHE_SECONDS })

  return ids
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get("date") || todayString()
    const page = parseInt(searchParams.get("page") || "1", 10)
    const filter = searchParams.get("filter") || "all"

    const { leagues } = await fetchDayFixtures(date)
    const trendingIds = await getTrendingLeagueIds()

    let leagueIds = Object.keys(leagues)

    if (filter === "trending") {
      leagueIds = leagueIds.filter((id) => trendingIds.includes(Number(id)))
    }

    leagueIds.forEach((id) => {
      console.log({
        id,
        idType: typeof id,
        trending: trendingIds.includes(Number(id)),
        trendingNumber: trendingIds.includes(Number(id)),
        name: leagues[id].league.name,
      });
    });

    leagueIds.sort((a, b) => {
      const aTrending = trendingIds.includes(Number(a))
      const bTrending = trendingIds.includes(Number(b))
      if (aTrending !== bTrending) return aTrending ? -1 : 1
      return leagues[a].league.name.localeCompare(leagues[b].league.name)
    })

    const totalLeagues = leagueIds.length
    const totalPages = Math.ceil(totalLeagues / LEAGUES_PER_PAGE)
    const start = (page - 1) * LEAGUES_PER_PAGE
    const pageIds = leagueIds.slice(start, start + LEAGUES_PER_PAGE)

    return Response.json({
      success: true,
      data: {
        date,
        page,
        totalPages,
        totalLeagues,
        leagues: pageIds.map((id) => leagues[id]),
      },
    })
  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}