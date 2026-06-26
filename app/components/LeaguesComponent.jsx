"use client"

import { CheckCircle, ChevronDown, ChevronRight, Search } from "lucide-react"
import { useEffect, useState, useDeferredValue } from "react"
import { motion, AnimatePresence } from "framer-motion"
import useSWR from "swr"
import Image from "next/image"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { toggleFavourite } from "@/services/favourites"
import LeaguesList from "./LeaguesList"
import Standings from "./Standings"
import Loader from "./Loader"
import LeagueSkeleton from "./LeagueSkeleton"

const PAGE_SIZE = 20

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result.data
}

function LeaguesComponent() {
  const [search, setSearch] = useState("")
  const deferredSearch = useDeferredValue(search) // doesn't block typing

  const [page, setPage] = useState(1)
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

  const { data: leagues = [], isLoading } = useSWR(
    `/api/leagues?filter=${filter}`,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  useEffect(() => {
    setPage(1)
  }, [filter, deferredSearch])

  const filtered = leagues.filter((l) =>
    l.league.name.toLowerCase().includes(deferredSearch.toLowerCase()) ||
    l.country.name.toLowerCase().includes(deferredSearch.toLowerCase())
  )

  // Slice for current page
  const paginated = filtered.slice(0, page * PAGE_SIZE)
  const hasMore = paginated.length < filtered.length

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
            leagues={paginated}
            onSelectLeague={setSelectedLeague}
            isLoading={isLoading}
          />

          {!isLoading && hasMore && (
            <button
              className="load-more-btn"
              onClick={() => setPage((p) => p + 1)}
            >
              Show more ({filtered.length - paginated.length} remaining)
            </button>
          )}
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