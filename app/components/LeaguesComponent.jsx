"use client"

import { CheckCircle, ChevronDown, Search } from "lucide-react"
import { useEffect, useState, useDeferredValue } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import LeaguesList from "./LeaguesList"
import Standings from "./Standings"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

function LeaguesComponent() {
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
      // search index items have flat shape {id, name, logo, country, flag}
      // so we need to reshape them to match what LeaguesList expects
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
    <div className="allLeaguesContainer">
      <div className="filters">
        {sortedFilters.map((item) => (
          <motion.div
            layout
            key={item}
            className={`each ${filter === item ? "active" : ""}`}
            onClick={() => setFilter(item)}
            transition={{ duration: 0.3 }}
          >
            <span>{item.replaceAll('_', ' ')}</span>
          </motion.div>
        ))}
      </div>

      <div className="searchBar-filter">
        <div className="searchBar">
          <Search size={17} className="icon" color="#5c5c5c" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leagues..."
          />
        </div>
        <div className="dropdown" style={{ width: '21.5%' }}>
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger asChild>
              <button className="button" style={{ display: 'flex', width: '100%', background: 'transparent', border: '.5px solid #5c5c5c', padding: '8px 6px', borderRadius: '6px', justifyContent: 'space-between', placeItems: 'center', textTransform: 'capitalize', cursor: 'pointer' }}>
                <div style={{ display: 'flex', gap: '6px', fontSize: '13px' }}>
                  <span className='status'>season</span>
                  <span className='menu'>{selected}</span>
                </div>
                <ChevronDown size={16} />
              </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content className="dropdown-container" sideOffset={8}>
                {seasons.map((season) => (
                  <DropdownMenu.Item
                    key={season}
                    onSelect={() => setSelected(season)}
                    className="dropdown-item"
                  >
                    {season}
                    {selected === season && <CheckCircle size={15} />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>

      <div className="allLeaguesList">
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
              transition={{ duration: 0.3 }}
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

export default LeaguesComponent