"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import LeagueGroup from "./LeagueGroup"
import { getUserTimeZone } from "@/lib/matchTime"
import { toggleFavourite } from "@/services/favourites"
import BuildYourXI from "./BuildYourXI"
import AIAssistant from "./AIAssistant"
import NewsPreview from "./NewsPreview"
import { useUser } from "@/context/userContext"
import { useToast } from "@/lib/useToast"
import { useFavorites } from "@/context/favoriteContext"

const fetcher = (url) => fetch(url).then((res) => res.json())

function formatDate(offsetDays) {
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

function secondSectionTitle(offsetDays) {
  if (offsetDays === 0) return "Today's Matches"
  if (offsetDays < 0) return "Match Results"
  return "Upcoming Fixtures"
}

const TABS = [
  { key: "all", label: "All" },
  { key: "live", label: "Live" },
  { key: "finished", label: "Finished" },
  { key: "trending", label: "Trending" },
]

/* ─── Animation Variants (motion-only, no static styling) ─── */
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
  exit: { opacity: 0, transition: { staggerChildren: 0.03, staggerDirection: -1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 22, stiffness: 300 } },
  exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15 } },
}

const sectionVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

/* ─── Sub-components (CSS classes instead of inline style objects) ─── */

function TabBar({ activeTab, onChange }) {
  return (
    <div className="tabBar">
      {TABS.map((t) => (
        <button key={t.key} className={`tabBar__btn ${activeTab === t.key ? "active" : ""}`} onClick={() => onChange(t.key)}>
          {activeTab === t.key && (
            <motion.div
              layoutId="activeTabBg"
              className={`tabBar__btnBg ${t.key === "live" ? "tabBar__btnBg--live" : "tabBar__btnBg--default"}`}
              transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
            />
          )}
          <span className="tabBar__btnLabel">
            {t.key === "live" && activeTab === "live" && (
              <motion.span
                className="tabBar__liveDot"
                animate={{ scale: [1, 1.35, 1] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              />
            )}
            {t.label}
          </span>
        </button>
      ))}
    </div>
  )
}

function DateNavigator({ offsetDays, onChange }) {
  const isToday = offsetDays === 0
  return (
    <motion.div layout className="dateNav">
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="dateNav__btn"
        onClick={() => onChange(offsetDays - 1)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </motion.button>

      <div className="dateNav__center">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="8" y1="3" x2="8" y2="7" />
          <line x1="16" y1="3" x2="16" y2="7" />
        </svg>
        <div className="dateNav__labelGroup">
          <span className="dateNav__label">{formatDateLabel(offsetDays)}</span>
          {isToday && (
            <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="dateNav__nowBadge">
              Now
            </motion.span>
          )}
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        className="dateNav__btn"
        onClick={() => onChange(offsetDays + 1)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </motion.button>
    </motion.div>
  )
}

export function SectionHeader({ title, live = false, onSeeAll }) {
  return (
    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="sectionHeader">
      <div className="sectionHeader__left">
        {live && <span className="sectionHeader__liveDot" />}
        <h2 className="sectionHeader__title">{title}</h2>
      </div>
      {onSeeAll && (
        <motion.button whileHover={{ x: 3 }} onClick={onSeeAll} className="sectionHeader__seeAll">
          See all
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M6 3H3C2.45 3 2 3.45 2 4V13C2 13.55 2.45 14 3 14H12C12.55 14 13 13.55 13 13V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="8" y1="8" x2="14" y2="2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <polyline points="10,2 14,2 14,6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
        </motion.button>
      )}
    </motion.div>
  )
}

export function MatchListSkeleton() {
  return (
    <div className="matchSkeleton">
      {Array.from({ length: 3 }).map((_, gi) => (
        <div key={gi} className="matchSkeleton__group">
          <div className="matchSkeleton__label" />
          {Array.from({ length: 3 }).map((_, mi) => (
            <div key={mi} className="matchSkeleton__row" style={{ animationDelay: `${mi * 0.1}s` }} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function EmptyState({ tab, offsetDays }) {
  const msg = tab === "live" ? "No live matches right now" : offsetDays === 0 ? "No matches scheduled today" : "No matches found"
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="emptyState">
      <svg className="emptyState__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <circle cx="12" cy="12" r="10" />
        <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
      </svg>
      <span className="emptyState__text">{msg}</span>
    </motion.div>
  )
}

/* ─── Main Component ─── */
function HomeBody() {
  const router = useRouter()
  const { preferences } = useUser()
  const { favorites } = useFavorites()
  const [offsetDays, setOffsetDays] = useState(0)
  const [tab, setTab] = useState(preferences?.defaultMatchView || "live")
  const [favouriteIds, setFavouriteIds] = useState(new Set())
  const [page, setPage] = useState(1)
  const [accumulatedLeagues, setAccumulatedLeagues] = useState([])

  useEffect(() => {
    if (favorites?.match?.length > 0) {
      const ids = new Set(favorites.match.map((f) => String(f.itemId)))
      setFavouriteIds(ids)
    }
  }, [favorites])

  const date = formatDate(offsetDays)
  const tz = getUserTimeZone()

  const statusParam = tab === "live" ? "live" : tab === "finished" ? "finished" : "all"
  const leagueFilterParam = tab === "trending" ? "trending" : "all"

  const { data: liveData } = useSWR(
    offsetDays === 0 ? `/api/matches?date=${date}&status=live&tz=${encodeURIComponent(tz)}` : null,
    fetcher,
    { refreshInterval: 30000, revalidateOnFocus: false }
  )

  const { data: mainData, isLoading } = useSWR(
    `/api/matches?date=${date}&status=${statusParam}&filter=${leagueFilterParam}&tz=${encodeURIComponent(tz)}&page=${page}`,
    fetcher,
    { revalidateOnFocus: false, refreshInterval: offsetDays === 0 && page === 1 ? 60000 : 0 }
  )

  useEffect(() => {
    setPage(1)
    setAccumulatedLeagues([])
  }, [date, statusParam, leagueFilterParam])

  useEffect(() => {
    if (!mainData?.data) return
    setAccumulatedLeagues((prev) => (page === 1 ? mainData.data.leagues : [...prev, ...mainData.data.leagues]))
  }, [mainData, page])

  const liveLeagues = liveData?.data?.leagues || []
  const mainLeagues = accumulatedLeagues
  const totalPages = mainData?.data?.totalPages || 1
  const hasMorePages = page < totalPages

  const { success, error } = useToast()

  const liveLeagueGroups = useMemo(
    () =>
      liveLeagues
        .map((g) => ({
          ...g,
          matches: g.matches.filter((m) => m.status === "LIVE").sort((a, b) => a.timestamp - b.timestamp),
        }))
        .filter((g) => g.matches.length > 0),
    [liveLeagues]
  )

  const hasLiveMatches = liveLeagueGroups.length > 0

  async function handleToggleFavourite(match) {
    const id = String(match.id)
    const wasFavourite = favouriteIds.has(id)

    setFavouriteIds((prev) => {
      const next = new Set(prev)
      wasFavourite ? next.delete(id) : next.add(id)
      return next
    })

    const result = await toggleFavourite({
      itemId: id,
      type: "MATCH",
      name: `${match.teams.home.name} vs ${match.teams.away.name}`,
      logo: match.teams.home.logo,
    })

    if (!result.success) {
      setFavouriteIds((prev) => {
        const next = new Set(prev)
        wasFavourite ? next.add(id) : next.delete(id)
        return next
      })
      error(result.message)
    }
    success(result.message || (wasFavourite ? "Removed from favourites" : "Added to favourites"))
  }

  // "See all" navigation — carries the relevant filter + date into the All Matches page
  function goToAllMatches(filterOverride) {
    const filter = filterOverride || statusParam
    router.push(`/main/matches/all?filter=${filter}&date=${date}`)
  }

  return (
    <div className="main-container">
      <div className="Matches-section">
        <div className="ads-Image-container">
          <Image height={20} width={20} className="ads-picture" src="/goalIQ22.png" alt="ads" />
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="homeControlBar">
          <div className="homeControlBar__row" style={{ alignItems: 'center', }}>
            <DateNavigator offsetDays={offsetDays} onChange={setOffsetDays} />
            <TabBar activeTab={tab} onChange={setTab} />
          </div>
        </motion.div>

        {/* ─── Live Matches ─── */}
        <AnimatePresence mode="wait">
          {(tab === "live" || tab === "all") && (hasLiveMatches || (tab === "live" && mainLeagues.length > 0)) && (
            <motion.div
              key="live-section"
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="livematches-section homeSectionCard"
            >
              <SectionHeader title="Live Matches" live onSeeAll={() => goToAllMatches("live")} />
              <motion.div variants={containerVariants} initial="hidden" animate="show" className="livematches-container">
                <AnimatePresence mode="popLayout">
                  {(hasLiveMatches ? liveLeagueGroups : mainLeagues).map((group) => (
                    <motion.div key={group.league.id} variants={itemVariants} layout>
                      <LeagueGroup group={group} favouriteIds={favouriteIds} onToggleFavourite={handleToggleFavourite} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Main Matches ─── */}
        <AnimatePresence mode="wait">
          {tab !== "live" && (
            <motion.div
              key={`${tab}-${date}-${page}`}
              variants={sectionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="livematches-section homeSectionCard"
            >
              <SectionHeader title={secondSectionTitle(offsetDays)} onSeeAll={() => goToAllMatches()} />

              {isLoading && accumulatedLeagues.length === 0 ? (
                <MatchListSkeleton />
              ) : !isLoading && mainLeagues.length === 0 ? (
                <EmptyState tab={tab} offsetDays={offsetDays} />
              ) : (
                <motion.div variants={containerVariants} initial="hidden" animate="show" className="livematches-container">
                  <AnimatePresence mode="popLayout">
                    {mainLeagues.map((group) => (
                      <motion.div key={group.league.id} variants={itemVariants} layout>
                        <LeagueGroup group={group} favouriteIds={favouriteIds} onToggleFavourite={handleToggleFavourite} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </motion.div>
              )}

              {hasMorePages && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setPage((p) => p + 1)}
                  disabled={isLoading}
                  className="homeLoadMore"
                >
                  {isLoading ? (
                    <span className="homeLoadMore__spinnerRow">
                      <motion.span
                        className="homeLoadMore__spinner"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      />
                      Loading more...
                    </span>
                  ) : (
                    "Load more leagues"
                  )}
                </motion.button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="right-side">
        <BuildYourXI players={[]} />
        <AIAssistant />
        <NewsPreview />
      </div>
    </div>
  )
}

export default HomeBody
