"use client"

import { CheckCircle, ChevronDown, ChevronRight, Search } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import Image from "next/image"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { signIn, signOut } from "next-auth/react"
import { toggleFavourite } from "@/services/favourites"
import LeaguesList from "./LeaguesList"
import Standings from "./Standings"
import { AnimatePresence } from "framer-motion"

const fetcher = (url) => fetch(url).then((res) => res.json())

function LeaguesComponent() {
  const [filter, setFilter] = useState("topLeagues")
  const [search, setSearch] = useState("")
  const [seasons, setSeasons] = useState([
    '2022',
    '2023',
    '2024'
  ])
  const [selected, setSelected] = useState(seasons[0])
  const [selectedLeague, setSelectedLeague] = useState(null)

  const filterItems = [
    "favourites",
    "topLeagues",
    "allLeagues",
    "europe",
    "africa",
    "asia",
    "america",
  ]

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
            <span>{item}</span>
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
      <button onClick={() => signOut()}>
        Sign Out
      </button>

      <AnimatePresence mode="wait">
        {!selectedLeague ? (
          <motion.div
            key="league-list"
            initial={{ x: 0 }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.3 }}
          >

            <div className="allLeaguesList">
              <LeaguesList leagues={leagues} onSelectLeague={setSelectedLeague} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="standings"
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

      {isLoading && <p>Loading...</p>}
    </div>
  )
}

export default LeaguesComponent