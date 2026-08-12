"use client"

import { CheckCircle, ChevronDown, Search } from "lucide-react"
import { useEffect, useState, useDeferredValue } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import LeaguesList from "./LeaguesList"
import Standings from "./Standings"
import { useUser } from "@/context/userContext"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

export default function LeaguesComponent() {
  const { preferences } = useUser()
  const dataSaver = preferences?.dataSaver ?? false
  const userCountry = preferences?.country ?? ""

  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  const [allLeaguesPage, setAllLeaguesPage] = useState(0)
  const [accumulatedLeagues, setAccumulatedLeagues] = useState([])

  const [seasons] = useState(['2022', '2023', '2024'])
  const [selected, setSelected] = useState('2022')
  const [selectedLeague, setSelectedLeague] = useState(null)

  const filterItems = [
    "favorites",
    "top_leagues",
    "all_leagues",
    "europe",
    "africa",
    "asia",
    "america",
  ]

  const [filter, setFilter] = useState(filterItems[1])

  const sortedFilters = [
    filter,
    ...filterItems.filter((item) => item !== filter),
  ]

  // Main fetch — paginated for all_leagues, single fetch for everything else
  const { data, isLoading } = useSWR(
    filter === "all_leagues"
      ? `/api/leagues?filter=all_leagues&page=${allLeaguesPage}`
      : `/api/leagues?filter=${filter}`,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  // Search — only fires for all_leagues with 2+ chars typed
  const { data: searchData, isLoading: isSearchLoading } = useSWR(
    filter === "all_leagues" && deferredSearch.length >= 2
      ? `/api/leagues/search?q=${encodeURIComponent(deferredSearch)}`
      : null,
    fetcher,
    {
      dedupingInterval: 5000,
      revalidateOnFocus: false,
    }
  )

  // Accumulate pages for all_leagues infinite scroll
  useEffect(() => {
    if (filter !== "all_leagues" || !data?.data) return
    setAccumulatedLeagues(prev =>
      allLeaguesPage === 0 ? data.data : [...prev, ...data.data]
    )
    setIsLoadingMore(false)
  }, [data, allLeaguesPage])

  // Reset everything when filter changes
  useEffect(() => {
    setAllLeaguesPage(0)
    setAccumulatedLeagues([])
    setIsLoadingMore(false)
  }, [filter])

  // Decide what leagues to show
  const rawLeagues = data?.data ?? []
  const total = data?.total ?? 0

  const displayLeagues = (() => {
    if (filter === "all_leagues") {
      // Searching — use search endpoint results
      if (deferredSearch.length >= 2) {
        return searchData?.data ?? []
      }
      // Not searching — use accumulated paginated results
      return accumulatedLeagues
    }

    // Small filters — search locally, already have full data
    if (deferredSearch.length >= 2) {
      return rawLeagues.filter(l =>
        l.league.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
        l.country.name.toLowerCase().includes(deferredSearch.toLowerCase())
      )
    }

    return rawLeagues
  })()

  const hasMore = filter === "all_leagues" &&
    deferredSearch.length < 2 &&
    accumulatedLeagues.length < total

  const showLoading = !isLoadingMore && (isLoading ||
    (filter === "all_leagues" && deferredSearch.length >= 2 && isSearchLoading))

  const loadingMore = isLoadingMore

  return (
    <div className="allLeaguesContainer" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* ─── Control Bar ─── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: "100%",
          background: "rgba(12, 17, 23, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(70, 82, 97, 0.18)",
          borderRadius: 20,
          padding: "16px 18px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* Filter Tabs */}
        <div
          className="filters"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          {sortedFilters.map((item) => {
            const active = filter === item
            return (
              <motion.button
                layout
                key={item}
                onClick={() => setFilter(item)}
                style={{
                  padding: "7px 16px",
                  borderRadius: 10,
                  border: "none",
                  background: active ? "#1b3a5c" : "rgba(27, 43, 62, 0.4)",
                  color: active ? "#fff" : "#8896a8",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  letterSpacing: "0.2px",
                  transition: "all 0.2s ease",
                  whiteSpace: "nowrap",
                }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {item.replaceAll('_', ' ')}
              </motion.button>
            )
          })}
        </div>

        {/* Search + Season */}
        <div
          className="searchBar-filter"
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <div
            className="searchBar"
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              gap: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(70, 82, 97, 0.25)",
              borderRadius: 12,
              padding: "10px 14px",
              minWidth: 200,
            }}
          >
            <Search size={16} color="#8896a8" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search leagues..."
              style={{
                background: "transparent",
                border: "none",
                outline: "none",
                color: "#fff",
                fontSize: 13,
                width: "100%",
              }}
            />
          </div>

          <div className="dropdown" style={{ width: 140, flexShrink: 0 }}>
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button
                  className="button"
                  style={{
                    display: "flex",
                    width: "100%",
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(70, 82, 97, 0.25)",
                    padding: "10px 12px",
                    borderRadius: 12,
                    justifyContent: "space-between",
                    alignItems: "center",
                    textTransform: "capitalize",
                    cursor: "pointer",
                    color: "#fff",
                    fontSize: 13,
                  }}
                >
                  <div style={{ display: "flex", gap: 6, fontSize: 13, alignItems: "center" }}>
                    <span style={{ color: "#8896a8" }}>season</span>
                    <span style={{ fontWeight: 600 }}>{selected}</span>
                  </div>
                  <ChevronDown size={16} color="#8896a8" />
                </button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="dropdown-container"
                  sideOffset={8}
                  style={{
                    background: "#111",
                    border: "1px solid #333",
                    borderRadius: 12,
                    padding: 6,
                    minWidth: 140,
                    zIndex: 100,
                  }}
                >
                  {seasons.map((season) => (
                    <DropdownMenu.Item
                      key={season}
                      onSelect={() => setSelected(season)}
                      style={{
                        padding: "8px 12px",
                        borderRadius: 8,
                        fontSize: 13,
                        color: "#fff",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        outline: "none",
                        background: selected === season ? "rgba(59,130,246,0.15)" : "transparent",
                      }}
                    >
                      {season}
                      {selected === season && <CheckCircle size={15} color="#3b82f6" />}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </motion.div>

      {/* ─── List + Standings Slide-In ─── */}
      <div className="allLeaguesList" style={{ position: "relative", overflow: "hidden" }}>
        <div className="list-layer">
          <LeaguesList
            leagues={displayLeagues}
            onSelectLeague={setSelectedLeague}
            isLoading={showLoading}
            loadingMore={loadingMore}
            setIsLoadingMore={setIsLoadingMore}
            setAllLeaguesPage={setAllLeaguesPage}
            showLoading={showLoading}
            hasMore={hasMore}
            total={total}
            accumulatedLeagues={accumulatedLeagues}
            isSearchResult={filter === "all_leagues" && deferredSearch.length >= 2}
            dataSaver={dataSaver}
            userCountry={userCountry}
          />
        </div>

        <AnimatePresence mode="wait">
          {selectedLeague && (
            <motion.div
              key="standingsPanel"
              className="standingsPanel"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <Standings
                league={selectedLeague}
                onBack={() => setSelectedLeague(null)}
                season={selected}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}