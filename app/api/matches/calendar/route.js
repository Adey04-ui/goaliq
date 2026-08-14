import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { fetchDayFixtures, todayString } from "@/lib/fixtures"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"


async function getCurrentUserId() {
  const session = await getServerSession(authOptions)
  return session?.user?.id ?? null
}

function getMonthDates(yearMonth) {
  const [year, month] = yearMonth.split("-").map(Number)
  const daysInMonth = new Date(year, month, 0).getDate()
  const dates = []
  for (let d = 1; d <= daysInMonth; d++) {
    dates.push(`${yearMonth}-${String(d).padStart(2, "0")}`)
  }
  return dates
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

function isFavouriteMatch(match, favs) {
  return (
    favs.leagues.has(String(match.league.id)) ||
    favs.teams.has(String(match.teams.home.id)) ||
    favs.teams.has(String(match.teams.away.id)) ||
    favs.matches.has(String(match.id))
  )
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || todayString().slice(0, 7)
    const timeZone = searchParams.get("tz") || "UTC"

    const userId = await getCurrentUserId(request)
    const favs = await getUserFavourites(userId)

     console.log("Calendar auth:", { userId, favCount: favs.matches.size + favs.leagues.size + favs.teams.size })

    const dates = getMonthDates(month)
    await Promise.all(dates.map((d) => fetchDayFixtures(d)))

    const days = await Promise.all(
      dates.map(async (date) => {
        const cached = await redis.get(`matches:${date}`)
        if (!cached?.leagues) {
          return { date, total: 0, live: 0, finished: 0, upcoming: 0, hasLive: false }
        }

        const allMatches = Object.values(cached.leagues).flatMap((g) => g.matches)
        const matches =
          favs.leagues.size === 0 && favs.teams.size === 0 && favs.matches.size === 0
            ? []
            : allMatches.filter((m) => isFavouriteMatch(m, favs))

        const live = matches.filter((m) => m.status === "LIVE").length
        const finished = matches.filter((m) => m.status === "FINISHED").length

        return {
          date,
          total: matches.length,
          live,
          finished,
          upcoming: matches.length - live - finished,
          hasLive: live > 0,
        }
      })
    )

    return Response.json({ success: true, data: { month, days } })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}