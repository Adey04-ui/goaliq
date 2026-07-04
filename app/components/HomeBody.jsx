"use client"

import React, { useState, useMemo, useEffect } from "react"
import Image from "next/image"
import useSWR from "swr"
import LeagueGroup from "./LeagueGroup"
import { getUserTimeZone } from "@/lib/matchTime"
import { toggleFavourite } from "@/services/favourites" // adjust path if this actually lives in app/api/favourites/route.js exports

const fetcher = (url) => fetch(url).then((res) => res.json())

function formatDate(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  // en-CA locale formats as YYYY-MM-DD, and critically stays in LOCAL time
  // (toISOString() would convert to UTC first, shifting the date near midnight)
  return d.toLocaleDateString("en-CA")
}

function formatDateLabel(offsetDays) {
  if (offsetDays === 0) return "Today"
  if (offsetDays === -1) return "Yesterday"
  if (offsetDays === 1) return "Tomorrow"
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function secondSectionTitle(offsetDays) {
  if (offsetDays === 0) return "today matches"
  if (offsetDays < 0) return "results"
  return "fixtures"
}

const TABS = [
  { key: "all", label: "all" },
  { key: "live", label: "live" },
  { key: "finished", label: "finished" },
  { key: "trending", label: "trending" },
]

function HomeBody() {
  const [offsetDays, setOffsetDays] = useState(0)
  const [tab, setTab] = useState("all")
  const [favouriteIds, setFavouriteIds] = useState(new Set())
  const [page, setPage] = useState(1)
  const [accumulatedLeagues, setAccumulatedLeagues] = useState([])

  const date = formatDate(offsetDays)
  const tz = getUserTimeZone()

  // status param only applies to the second (tab-driven) section — live highlights always pull status=live separately
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

  // reset to page 1 whenever the date or active filter changes
  useEffect(() => {
    setPage(1)
    setAccumulatedLeagues([])
  }, [date, statusParam, leagueFilterParam])

  // accumulate leagues as more pages load; page 1 replaces, later pages append
  useEffect(() => {
    if (!mainData?.data) return
    setAccumulatedLeagues((prev) => (page === 1 ? mainData.data.leagues : [...prev, ...mainData.data.leagues]))
  }, [mainData, page])

  const liveLeagues = liveData?.data?.leagues || []
  const mainLeagues = accumulatedLeagues
  const totalPages = mainData?.data?.totalPages || 1
  const hasMorePages = page < totalPages

  // live section: grouped by league, but each league only keeps its live matches
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

    // optimistic UI
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
      // revert on failure
      setFavouriteIds((prev) => {
        const next = new Set(prev)
        wasFavourite ? next.add(id) : next.delete(id)
        return next
      })
    }
  }

  return (
    <div className="main-container">
      <div className="Matches-section">
        <div className="ads-Image-container">
          <Image height={20} width={20} className="ads-picture" src="/goalIQ22.png" alt="ads" />
        </div>

        <div className="father-today-the-rest">
          <div className="today-right-left-arrow">
            <button className="today-side-arrow-button" onClick={() => setOffsetDays((d) => d - 1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className="date-picker">
              <svg viewBox="0 0 24 24">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
              </svg>
              {formatDateLabel(offsetDays)}
            </div>
            <button className="today-side-arrow-button" onClick={() => setOffsetDays((d) => d + 1)}>
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="white" fill="none" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div className="live-finished-trending-all-main-container">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={t.key === "live" ? "live-button" : `l-f-t-a-button${tab === t.key ? " active" : ""}`}
                onClick={() => setTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {hasLiveMatches && (
          <div className="livematches-section">
            <div className="livematches-container">
              <div className="live-matches-header">
                <div style={{ fontWeight: 600, display: "flex", gap: "10px", alignItems: "center" }}>
                  <span className="pulsing-dot"></span>
                  live matches
                </div>
                <div
                  style={{ fontSize: "13px", display: "flex", gap: "10px", placeItems: "center", cursor: "pointer" }}
                  className="see-all-btn"
                >
                  see all
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M6 3H3C2.45 3 2 3.45 2 4V13C2 13.55 2.45 14 3 14H12C12.55 14 13 13.55 13 13V10"
                      stroke="#ffffff"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <line x1="8" y1="8" x2="14" y2="2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                    <polyline points="10,2 14,2 14,6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </svg>
                </div>
              </div>
              {liveLeagueGroups.map((group) => (
                <LeagueGroup
                  key={group.league.id}
                  group={group}
                  favouriteIds={favouriteIds}
                  onToggleFavourite={handleToggleFavourite}
                />
              ))}
            </div>
          </div>
        )}

        {tab !== "live" && (<div className="livematches-section">
          <div className="livematches-container">
            <div className="live-matches-header">
              <div style={{ fontWeight: 600, display: "flex", gap: "10px", alignItems: "center" }}>
                {secondSectionTitle(offsetDays)}
              </div>
              <div
                style={{ fontSize: "13px", display: "flex", gap: "10px", placeItems: "center", cursor: "pointer" }}
                className="see-all-btn"
              >
                see all
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M6 3H3C2.45 3 2 3.45 2 4V13C2 13.55 2.45 14 3 14H12C12.55 14 13 13.55 13 13V10"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <line x1="8" y1="8" x2="14" y2="2" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" />
                  <polyline points="10,2 14,2 14,6" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                </svg>
              </div>
            </div>

            {isLoading && <div style={{ padding: "20px", opacity: 0.6 }}>Loading matches...</div>}

            {!isLoading && mainLeagues.length === 0 && (
              <div style={{ padding: "20px", opacity: 0.6 }}>No matches found.</div>
            )}

            {mainLeagues.map((group) => (
              <LeagueGroup
                key={group.league.id}
                group={group}
                favouriteIds={favouriteIds}
                onToggleFavourite={handleToggleFavourite}
              />
            ))}

            {hasMorePages && (
              <button
                className="l-f-t-a-button"
                style={{ width: "100%", margin: "14px 0", padding: "10px" }}
                onClick={() => setPage((p) => p + 1)}
                disabled={isLoading}
              >
                {isLoading ? "Loading..." : "Load more leagues"}
              </button>
            )}
          </div>
        </div>)}
      </div>

      <div className="right-side"></div>
    </div>
  )
}

export default HomeBody
