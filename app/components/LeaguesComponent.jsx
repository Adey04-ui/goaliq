"use client"

import { CheckCircle, ChevronDown, ChevronRight, Search } from "lucide-react"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import Image from "next/image"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { signIn, signOut } from "next-auth/react"
import { toggleFavourite } from "@/services/favourites"
import LeaguesList from "./LeaguesList"
import Standings from "./Standings"
import { AnimatePresence } from "framer-motion"
import Loader from "./Loader"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message)
  }

  return result.data
}

function LeaguesComponent() {
  const [search, setSearch] = useState("")
  const [seasons, setSeasons] = useState([
    '2022',
    '2023',
    '2024'
  ])
  const [selected, setSelected] = useState(seasons[0])
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





  const handleSelect = (season) => {
    setSelected(season)
  }


  console.log(leagues)
  console.log(selected)

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
                  <span className='menu' style={{ color: `${selected.color}` }}>
                    {selected}
                  </span>
                </div>
                <span className="icpon">
                  <ChevronDown size={16} />
                </span>
              </button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                className="dropdown-container"
                sideOffset={8}
              >
                {seasons.map((season) => (
                  <DropdownMenu.Item key={season} onSelect={() => handleSelect(season)} className="dropdown-item" style={{}}>
                    {season}
                    {selected === season && <CheckCircle size={15} />}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        </div>
      </div>
      {/* just for testing */}
      {/* <button onClick={() => signOut()}>
        Sign Out
      </button> */}

      <div className="allLeaguesList">
        <div className="list-layer">
          {isLoading ? (
            <div style={{height: '100%', width: '100%', justifyContent: 'center', placeItems: 'center', display: 'flex'}}>
              <Loader />
            </div>
          ) : (
            <LeaguesList leagues={leagues} onSelectLeague={setSelectedLeague} />
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