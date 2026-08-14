import { redis } from "@/lib/redis"

export const STATUS_MAP = {
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

export function mapStatus(short) {
  return STATUS_MAP[short] || "UPCOMING"
}

export function todayString() {
  return new Date().toISOString().slice(0, 10)
}

const TODAY_CACHE_SECONDS = 60 * 60
const PAST_CACHE_SECONDS = 60 * 60 * 24 * 30
const FUTURE_CACHE_SECONDS = 60 * 60

export function getCacheTTL(date) {
  const today = todayString()
  if (date === today) return TODAY_CACHE_SECONDS
  if (date < today) return PAST_CACHE_SECONDS
  return FUTURE_CACHE_SECONDS
}

export function normalizeFixture(m) {
  return {
    id: m.fixture.id,
    date: m.fixture.date,
    timestamp: m.fixture.timestamp,
    status: mapStatus(m.fixture.status.short),
    statusShort: m.fixture.status.short,
    elapsed: m.fixture.status.elapsed,
    venue: m.fixture.venue?.name || null,
    league: {
      id: String(m.league.id),
      name: m.league.name,
      country: m.league.country,
      logo: m.league.logo,
      round: m.league.round,
    },
    teams: {
      home: { id: m.teams.home.id, name: m.teams.home.name, logo: m.teams.home.logo, winner: m.teams.home.winner },
      away: { id: m.teams.away.id, name: m.teams.away.name, logo: m.teams.away.logo, winner: m.teams.away.winner },
    },
    goals: { home: m.goals.home, away: m.goals.away },
  }
}

export function groupByLeague(fixtures) {
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

export async function fetchDayFixtures(date) {
  const cacheKey = `matches:${date}`
  const cached = await redis.get(cacheKey)
  if (cached) return cached

  const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${date}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  })

  if (!res.ok) throw new Error("Failed to fetch fixtures from API-Football")

  const data = await res.json()
  const normalized = data.response.map(normalizeFixture)
  const grouped = groupByLeague(normalized)

  const payload = { date, leagues: grouped }
  await redis.set(cacheKey, payload, { ex: getCacheTTL(date) })

  return payload
}

export function shiftDateString(dateStr, deltaDays) {
  const [y, m, d] = dateStr.split("-").map(Number)
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + deltaDays)
  return dt.toISOString().slice(0, 10)
}

export async function fetchLocalDayFixtures(localDate, timeZone) {
  const candidateDates = [
    shiftDateString(localDate, -1),
    localDate,
    shiftDateString(localDate, 1),
  ]

  const dayPayloads = await Promise.all(candidateDates.map(fetchDayFixtures))

  const allFixtures = dayPayloads.flatMap((payload) =>
    Object.values(payload.leagues).flatMap((group) => group.matches)
  )

  const matchingLocalDay = allFixtures.filter((f) => {
    const localFixtureDate = new Date(f.timestamp * 1000).toLocaleDateString("en-CA", {
      timeZone,
    })
    return localFixtureDate === localDate
  })

  return groupByLeague(matchingLocalDay)
}