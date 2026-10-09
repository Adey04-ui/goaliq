import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { fetchDayFixtures, todayString } from "@/lib/fixtures"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { withRateLimit } from "@/lib/withRateLimit"
import { routeErrorResponse } from "@/lib/apiFootball"

// A month is ~30 days = ~30 API-Football calls on a cold cache, but the free
// plan allows 10/minute and 100/day. So one request may fetch only a few
// missing days (closest to today first); the rest are reported as pending
// and fill in on later requests as the cache warms up.
const MAX_DAYS_FETCHED_PER_REQUEST = 3

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

const emptyDay = (date, loaded) => ({
  date,
  loaded,
  total: 0,
  live: 0,
  finished: 0,
  upcoming: 0,
  hasLive: false,
})

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get("month") || todayString().slice(0, 7)

    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      return Response.json(
        { success: false, message: "Invalid month" },
        { status: 400 }
      )
    }

    const dates = getMonthDates(month)

    const userId = await getCurrentUserId()
    const favs = await getUserFavourites(userId)

    // The calendar only counts FAVOURITE matches. With no favourites every day
    // is zero, so there is nothing worth fetching (this also protects the
    // budget from logged-out visitors).
    if (favs.leagues.size === 0 && favs.teams.size === 0 && favs.matches.size === 0) {
      return Response.json({
        success: true,
        data: { month, days: dates.map((d) => emptyDay(d, true)), pending: 0 },
      })
    }

    // One Redis call for the whole month instead of 30+30.
    const cachedDays = await redis.mget(...dates.map((d) => `matches:${d}`))

    // Fetch a few missing days, nearest to today first.
    const todayMs = Date.parse(todayString())
    const missing = dates
      .map((date, i) => ({ date, i }))
      .filter(({ i }) => cachedDays[i] == null)
      .sort(
        (a, b) =>
          Math.abs(Date.parse(a.date) - todayMs) -
          Math.abs(Date.parse(b.date) - todayMs)
      )
      .slice(0, MAX_DAYS_FETCHED_PER_REQUEST)

    // allSettled: if the API-Football budget runs out, the calendar still
    // returns what it has instead of failing completely.
    const fetched = await Promise.allSettled(
      missing.map(({ date }) => fetchDayFixtures(date))
    )

    fetched.forEach((result, k) => {
      if (result.status === "fulfilled") {
        cachedDays[missing[k].i] = result.value
      } else {
        console.error(`[calendar] day ${missing[k].date} not loaded:`, result.reason?.message)
      }
    })

    let pending = 0

    const days = dates.map((date, i) => {
      const payload = cachedDays[i]

      if (!payload?.leagues) {
        pending++
        return emptyDay(date, false)
      }

      const matches = Object.values(payload.leagues)
        .flatMap((g) => g.matches)
        .filter((m) => isFavouriteMatch(m, favs))

      const live = matches.filter((m) => m.status === "LIVE").length
      const finished = matches.filter((m) => m.status === "FINISHED").length

      return {
        date,
        loaded: true,
        total: matches.length,
        live,
        finished,
        upcoming: matches.length - live - finished,
        hasLive: live > 0,
      }
    })

    return Response.json({ success: true, data: { month, days, pending } })
  } catch (error) {
    return routeErrorResponse(error, "calendar")
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })