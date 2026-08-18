"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import LeagueGroup from "@/app/components/LeagueGroup"
import { MatchListSkeleton, EmptyState } from "@/app/components/HomeBody"
import { getUserTimeZone } from "@/lib/matchTime"
import { toggleFavourite } from "@/services/favourites"
import { useFavorites } from "@/context/favoriteContext"

const fetcher = (url) => fetch(url).then((res) => res.json())

const FILTERS = [
  { key: "live", label: "Live" },
  { key: "finished", label: "Finished" },
  { key: "upcoming", label: "Upcoming" },
]

function formatDateISO(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toLocaleDateString("en-CA")
}

function formatDateLabel(offsetDays) {
  if (offsetDays === 0) return "Today"
  if (offsetDays === -1) return "Yesterday"
  if (offsetDays === 1) return "Tomorrow"
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
}

// offsetDays relative to today, derived from a "YYYY-MM-DD" param
function offsetFromDateString(dateStr) {
  if (!dateStr) return 0
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + "T00:00:00")
  const diffMs = target - today
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

function AllMatchesContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { favorites } = useFavorites()

  const initialFilter = searchParams.get("filter") || "live"
  const initialDateParam = searchParams.get("date")

  const [filter, setFilter] = useState(FILTERS.some((f) => f.key === initialFilter) ? initialFilter : "live")
  const [offsetDays, setOffsetDays] = useState(filter === "live" ? 0 : offsetFromDateString(initialDateParam))
  const [page, setPage] = useState(1)
  const [accumulatedLeagues, setAccumulatedLeagues] = useState([])
  const [favouriteIds, setFavouriteIds] = useState(new Set())

  useEffect(() => {
    if (favorites?.match?.length > 0) {
      setFavouriteIds(new Set(favorites.match.map((f) => String(f.itemId))))
    }
  }, [favorites])

  // live matches only make sense "today" — force the date back when switching to that filter
  function handleFilterChange(key) {
    setFilter(key)
    if (key === "live") setOffsetDays(0)
    router.replace(`/main/matches/all?filter=${key}&date=${formatDateISO(key === "live" ? 0 : offsetDays)}`)
  }

  function handleDateChange(newOffset) {
    setOffsetDays(newOffset)
    router.replace(`/main/matches/all?filter=${filter}&date=${formatDateISO(newOffset)}`)
  }

  const date = formatDateISO(offsetDays)
  const tz = getUserTimeZone()

  const { data, isLoading } = useSWR(
    `/api/matches?date=${date}&status=${filter}&tz=${encodeURIComponent(tz)}&page=${page}`,
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: filter === "live" ? 30000 : 0,
    }
  )

  useEffect(() => {
    setPage(1)
    setAccumulatedLeagues([])
  }, [date, filter])

  useEffect(() => {
    if (!data?.data) return
    setAccumulatedLeagues((prev) => (page === 1 ? data.data.leagues : [...prev, ...data.data.leagues]))
  }, [data, page])

  const leagues = accumulatedLeagues
  const totalPages = data?.data?.totalPages || 1
  const hasMorePages = page < totalPages

  async function handleToggleFavourite(match) {
    const id = String(match.id)
    const wasFavourite = favouriteIds.has(id)
    setFavouriteIds((prev) => {
      const next = new Set(prev)
      wasFavourite ? next.delete(id) : next.add(id)
      return next
    })
    await toggleFavourite({
      itemId: id,
      type: "MATCH",
      name: `${match.teams.home.name} vs ${match.teams.away.name}`,
      logo: match.teams.home.logo,
    })
  }

  return (
    <div className="parent-container">
      <div className="allMatchesPage">
        <div className="allMatchesPage__header">
          <h1 className="allMatchesPage__heading">All Matches</h1>
        </div>

        <div className="allMatchesPage__controls">
          <div className="tabBar">
            {FILTERS.map((f) => (
              <button key={f.key} className={`tabBar__btn ${filter === f.key ? "active" : ""}`} onClick={() => handleFilterChange(f.key)}>
                {filter === f.key && (
                  <motion.div
                    layoutId="allMatchesTabBg"
                    className={`tabBar__btnBg ${f.key === "live" ? "tabBar__btnBg--live" : "tabBar__btnBg--default"}`}
                    transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                  />
                )}
                <span className="tabBar__btnLabel">{f.label}</span>
              </button>
            ))}
          </div>

          {filter !== "live" && (
            <div className="dateNav" style={{ width: "auto" }}>
              <button className="dateNav__btn" onClick={() => handleDateChange(offsetDays - 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <div className="dateNav__center">
                <span className="dateNav__label">{formatDateLabel(offsetDays)}</span>
              </div>
              <button className="dateNav__btn" onClick={() => handleDateChange(offsetDays + 1)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>

        <div className="livematches-section homeSectionCard">
          {isLoading && accumulatedLeagues.length === 0 ? (
            <MatchListSkeleton />
          ) : !isLoading && leagues.length === 0 ? (
            <EmptyState tab={filter} offsetDays={offsetDays} />
          ) : (
            <div className="livematches-container">
              <AnimatePresence mode="popLayout">
                {leagues.map((group) => (
                  <motion.div key={group.league.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} layout>
                    <LeagueGroup group={group} favouriteIds={favouriteIds} onToggleFavourite={handleToggleFavourite} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {hasMorePages && (
            <button className="homeLoadMore" onClick={() => setPage((p) => p + 1)} disabled={isLoading}>
              {isLoading ? "Loading more..." : "Load more leagues"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AllMatchesPage() {
  return (
    <Suspense fallback={<MatchListSkeleton />}>
      <AllMatchesContent />
    </Suspense>
  )
}