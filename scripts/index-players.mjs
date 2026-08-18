import { config } from "dotenv"
config({ path: ".env.local" })

const { prisma } = await import("../lib/prisma.js")

const SEASON = 2024
const MAX_PAGE = 3 // hard free-tier cap — squads over 60 players (20/page) will be incomplete, that's a plan limit
const MAX_REQUESTS_PER_RUN = 80 // stays under the 100/day cap, leaving headroom for normal app usage that day
const DELAY_MS = 6500 // free tier is 10 req/min — 6.5s spacing keeps us safely under that

const LEAGUES = [
  { id: 39, name: "Premier League" },
  { id: 140, name: "La Liga" },
  { id: 61, name: "Ligue 1" },
  { id: 135, name: "Serie A" },
  { id: 78, name: "Bundesliga" },
]

let requestCount = 0
let quotaExhausted = false

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function fetchApiFootball(endpoint) {
  if (quotaExhausted) return { response: [], paging: { current: 1, total: 1 } }

  if (requestCount >= MAX_REQUESTS_PER_RUN) {
    console.log(`\n  Reached this run's request budget (${MAX_REQUESTS_PER_RUN}). Stopping cleanly — run again to continue.`)
    quotaExhausted = true
    return { response: [], paging: { current: 1, total: 1 } }
  }

  await sleep(DELAY_MS)
  requestCount++

  const res = await fetch(`https://v3.football.api-sports.io${endpoint}`, {
    headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
  })

  if (res.status === 429) {
    console.error(`  ! Hit 429 despite pacing — quota is actually exhausted. Stopping run.`)
    quotaExhausted = true
    return { response: [], paging: { current: 1, total: 1 } }
  }

  if (!res.ok) {
    console.error(`  ! Request failed: ${endpoint} (${res.status})`)
    return { response: [], paging: { current: 1, total: 1 } }
  }

  const data = await res.json()

  if (data.errors && Object.keys(data.errors).length > 0) {
    console.error(`  ! API errors for ${endpoint}:`, data.errors)
  }

  return data
}

async function getTeamsForLeague(leagueId) {
  const data = await fetchApiFootball(`/teams?league=${leagueId}&season=${SEASON}`)
  return data.response.map((t) => t.team.id)
}

async function teamAlreadyIndexed(teamId) {
  const count = await prisma.playerIndex.count({ where: { teamId, season: SEASON } })
  return count > 0
}

async function getFullSquad(teamId) {
  const allPlayers = []
  let page = 1
  let totalPages = 1

  do {
    const data = await fetchApiFootball(`/players?team=${teamId}&season=${SEASON}&page=${page}`)
    allPlayers.push(...data.response)
    totalPages = Math.min(data.paging?.total || 1, MAX_PAGE)
    page++
  } while (page <= totalPages && !quotaExhausted)

  return allPlayers
}

async function main() {
  let total = 0

  for (const league of LEAGUES) {
    if (quotaExhausted) break

    console.log(`\nIndexing ${league.name}...`)
    const teamIds = await getTeamsForLeague(league.id)
    if (teamIds.length === 0 && !quotaExhausted) {
      console.log(`  No teams returned — check the error above`)
      continue
    }
    console.log(`  Found ${teamIds.length} teams`)

    for (const teamId of teamIds) {
      if (quotaExhausted) break

      if (await teamAlreadyIndexed(teamId)) {
        console.log(`  Team ${teamId}: already indexed, skipping`)
        continue
      }

      const players = await getFullSquad(teamId)

      for (const p of players) {
        const player = p.player
        const stats = p.statistics?.[0]

        await prisma.playerIndex.upsert({
          where: { id: player.id },
          update: {
            name: player.name,
            photo: player.photo,
            nationality: player.nationality,
            position: stats?.games?.position || player.position || null,
            teamId: stats?.team?.id || teamId,
            teamName: stats?.team?.name || null,
            teamLogo: stats?.team?.logo || null,
            leagueId: league.id,
            season: SEASON,
            updatedAt: new Date(),
          },
          create: {
            id: player.id,
            name: player.name,
            photo: player.photo,
            nationality: player.nationality,
            position: stats?.games?.position || player.position || null,
            teamId: stats?.team?.id || teamId,
            teamName: stats?.team?.name || null,
            teamLogo: stats?.team?.logo || null,
            leagueId: league.id,
            season: SEASON,
          },
        })

        total++
      }

      if (players.length > 0) {
        console.log(`  Team ${teamId}: ${players.length} players indexed`)
      }
    }
  }

  console.log(`\nDone this run. Indexed ${total} new players (${requestCount} requests used).`)
  if (quotaExhausted) {
    console.log(`Run again (tomorrow, if you hit the daily cap) to continue — already-indexed teams are skipped automatically.`)
  } else {
    console.log(`All leagues fully processed.`)
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
