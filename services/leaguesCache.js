// services/leaguesCache.js

let memoryLeagues = null
let memoryExpiry = 0

const SEVEN_DAYS = 1000 * 60 * 60 * 24 * 7

export async function getLeagues() {
  const now = Date.now()

  // Serve from memory if still fresh
  if (memoryLeagues && now < memoryExpiry) {
    console.log("Serving leagues from memory")
    return memoryLeagues
  }

  // Memory expired or empty — fetch from API Football
  console.log("Fetching leagues from API Football")

  const res = await fetch("https://v3.football.api-sports.io/leagues", {
    headers: {
      "x-apisports-key": process.env.API_FOOTBALL_KEY,
    },
  })

  if (!res.ok) {
    throw new Error(`API Football error: ${res.status}`)
  }

  const data = await res.json()

  memoryLeagues = data.response
  memoryExpiry = now + SEVEN_DAYS

  console.log(`Cached ${memoryLeagues.length} leagues in memory for 7 days`)

  return memoryLeagues
}