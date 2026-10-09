import { redis } from "@/lib/redis"
import { CONTINENTS } from "@/app/api/continents"
import { fetchApiFootballOrThrow, ApiFootballError } from "@/lib/apiFootball"

const SEVEN_DAYS = 60 * 60 * 24 * 7
const CHUNK_SIZE = 50

const TOP_LEAGUE_IDS = [39, 140, 78, 135, 61, 2, 3, 4, 5, 6]

const COUNT_KEY = "leagues:all_leagues:count" // written LAST: "cache is complete"
const SEARCH_KEY = "leagues:search_index"
const LOCK_KEY = "leagues:rebuild:lock"

// Which cached keys each filter reads. Anything not listed here is unknown and
// is answered with [] WITHOUT touching API-Football.
// ("america" is what the UI sends; the cache stores north/south separately.)
const FILTER_KEYS = {
  top_leagues: ["top_leagues"],
  europe: ["europe"],
  africa: ["africa"],
  asia: ["asia"],
  america: ["north-america", "south-america"],
  "north-america": ["north-america"],
  "south-america": ["south-america"],
  oceania: ["oceania"],
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

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
  pipeline.set(SEARCH_KEY, searchIndex, { ex: SEVEN_DAYS })

  // Count goes last: if it exists, everything above it was written.
  pipeline.set(COUNT_KEY, all.length, { ex: SEVEN_DAYS })

  await pipeline.exec()
  console.log(`[leagues] Redis populated — ${all.length} leagues stored`)
}

// Rebuilds the whole cache from API-Football ONLY when it is truly absent.
// A missing individual key (empty filter, page past the end) is NOT a reason
// to rebuild: that used to cost an API-Football call + ~6MB of Redis writes
// on every such request.
async function ensureCache() {
  if (await redis.exists(COUNT_KEY)) return

  // Single-flight: only one request rebuilds, the others wait for it.
  const gotLock = await redis.set(LOCK_KEY, "1", { nx: true, ex: 60 })

  if (!gotLock) {
    for (let i = 0; i < 10; i++) {
      await sleep(500)
      if (await redis.exists(COUNT_KEY)) return
    }
    // Still not ready: tell the client to retry shortly (503 + Retry-After).
    throw new ApiFootballError({ reason: "unavailable", retryAfter: 5 })
  }

  try {
    // Someone may have finished between our first check and getting the lock.
    if (await redis.exists(COUNT_KEY)) return

    console.log("[leagues] Cache missing — rebuilding from API-Football")
    const data = await fetchApiFootballOrThrow("/leagues")
    await populateRedis(data.response)
  } finally {
    await redis.del(LOCK_KEY)
  }
}

// For continent/top filters — returns full array, small payload
export async function getFilteredLeagues(filter) {
  const keys = FILTER_KEYS[filter]
  if (!keys) return [] // unknown filter: no upstream call

  const read = () => Promise.all(keys.map((k) => redis.get(`leagues:${k}`)))

  let lists = await read()

  if (lists.every((l) => l == null)) {
    await ensureCache() // rebuilds only if the cache is really gone
    lists = await read()
  }

  return lists.flatMap((l) => l ?? [])
}

// For all_leagues — returns one page at a time
export async function getPaginatedLeagues(page = 0) {
  const p = Number.isInteger(page) && page >= 0 ? page : 0
  const pageKey = `leagues:all_leagues:page:${p}`

  const read = () => Promise.all([redis.get(pageKey), redis.get(COUNT_KEY)])

  let [data, total] = await read()

  if (data == null || total == null) {
    await ensureCache()
    ;[data, total] = await read()
  }

  return { data: data ?? [], total: Number(total ?? 0), page: p }
}

// For search — returns lightweight index
export async function getSearchIndex() {
  let index = await redis.get(SEARCH_KEY)

  if (index == null) {
    await ensureCache()
    index = await redis.get(SEARCH_KEY)
  }

  return index ?? []
}