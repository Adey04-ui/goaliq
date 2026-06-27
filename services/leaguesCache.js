import { redis } from "@/lib/redis"
import { CONTINENTS } from "@/app/api/continents"

const SEVEN_DAYS = 60 * 60 * 24 * 7
const CHUNK_SIZE = 50

const TOP_LEAGUE_IDS = [39, 140, 78, 135, 61, 2, 3, 4, 5, 6]

async function fetchAllFromAPIFootball() {
  console.log("[leagues] Fetching from API Football...")

  const res = await fetch("https://v3.football.api-sports.io/leagues", {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY,
    },
  })

  if (!res.ok) throw new Error(`API Football error: ${res.status}`)

  const data = await res.json()
  return data.response
}

async function populateRedis(all) {
  const pipeline = redis.pipeline()

  // 1. Filtered continents — small payloads, instant retrieval
  pipeline.set("leagues:top_leagues",
    all.filter(l => TOP_LEAGUE_IDS.includes(l.league.id)),
    { ex: SEVEN_DAYS }
  )
  pipeline.set("leagues:europe",
    all.filter(l => CONTINENTS.europe.includes(l.country.name)),
    { ex: SEVEN_DAYS }
  )
  pipeline.set("leagues:africa",
    all.filter(l => CONTINENTS.africa.includes(l.country.name)),
    { ex: SEVEN_DAYS }
  )
  pipeline.set("leagues:asia",
    all.filter(l => CONTINENTS.asia.includes(l.country.name)),
    { ex: SEVEN_DAYS }
  )
  pipeline.set("leagues:north-america",
    all.filter(l => CONTINENTS.northAmerica.includes(l.country.name)),
    { ex: SEVEN_DAYS }
  )
  pipeline.set("leagues:south-america",
    all.filter(l => CONTINENTS.southAmerica.includes(l.country.name)),
    { ex: SEVEN_DAYS }
  )
  pipeline.set("leagues:oceania",
    all.filter(l => CONTINENTS.oceania.includes(l.country.name)),
    { ex: SEVEN_DAYS }
  )

  // 2. All leagues — paginated in chunks
  pipeline.set("leagues:all_leagues:count", all.length, { ex: SEVEN_DAYS })

  for (let i = 0; i < all.length; i += CHUNK_SIZE) {
    const page = Math.floor(i / CHUNK_SIZE)
    pipeline.set(
      `leagues:all_leagues:page:${page}`,
      all.slice(i, i + CHUNK_SIZE),
      { ex: SEVEN_DAYS }
    )
  }

  // 3. Lightweight search index — stripped down, ~300KB instead of 2.73MB
  const searchIndex = all.map(l => ({
    id: l.league.id,
    name: l.league.name,
    logo: l.league.logo,
    type: l.league.type,
    country: l.country.name,
    flag: l.country.flag,
  }))
  pipeline.set("leagues:search_index", searchIndex, { ex: SEVEN_DAYS })

  await pipeline.exec()
  console.log(`[leagues] Redis populated — ${all.length} leagues stored`)
}

// For continent/top filters — returns full array, small payload
export async function getFilteredLeagues(filter) {
  const cacheKey = `leagues:${filter}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    console.log(`[leagues] Redis hit — ${cacheKey}`)
    return cached
  }

  // Miss — fetch everything and populate all keys at once
  console.log(`[leagues] Redis miss — rebuilding cache`)
  const all = await fetchAllFromAPIFootball()
  await populateRedis(all)

  // Now return the specific filter
  const result = await redis.get(cacheKey)
  return result ?? []
}

// For all_leagues — returns one page at a time
export async function getPaginatedLeagues(page = 0) {
  const cacheKey = `leagues:all_leagues:page:${page}`
  const cached = await redis.get(cacheKey)

  if (cached) {
    const total = await redis.get("leagues:all_leagues:count") ?? 0
    console.log(`[leagues] Redis hit — page ${page}`)
    return { data: cached, total: Number(total), page }
  }

  // Miss — fetch and populate
  console.log(`[leagues] Redis miss — rebuilding cache`)
  const all = await fetchAllFromAPIFootball()
  await populateRedis(all)

  const pageData = all.slice(page * CHUNK_SIZE, (page + 1) * CHUNK_SIZE)
  return { data: pageData, total: all.length, page }
}

// For search — returns lightweight index
export async function getSearchIndex() {
  const cached = await redis.get("leagues:search_index")

  if (cached) {
    console.log("[leagues] Redis hit — search index")
    return cached
  }

  // Miss — fetch and populate
  const all = await fetchAllFromAPIFootball()
  await populateRedis(all)

  const result = await redis.get("leagues:search_index")
  return result ?? []
}