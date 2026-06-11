"use client"

import { CheckCircle, ChevronDown, ChevronRight, Search } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import Image from "next/image"
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { signIn } from "next-auth/react"

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
        <div className="dropdown" style={{width: '21.5%'}}>
          <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger asChild>
                <button className="button" style={{display: 'flex', width: '100%', background: 'transparent', border: '.5px solid #5c5c5c', padding: '8px 6px', borderRadius: '6px', justifyContent: 'space-between', placeItems: 'center', textTransform: 'capitalize', cursor: 'pointer'}}>
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
                    <DropdownMenu.Item key={season} onSelect={() => handleSelect(season)} className="dropdown-item" style={{  }}>
                      {season}
                      {selected === season && <CheckCircle size={15} />}
                    </DropdownMenu.Item>
                  ))}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
        </div>
      </div>
      <button onClick={() => signIn("google")}>
      Continue with Google
    </button>

      <div className="allLeaguesList">
        {leagues.map((league) => (
          <div className="eachList" key={league.league.id}>
            <div className="left">
              <div className="leagueImage">
                <Image width={40} height={40} alt="league_logo" src={league.league.logo} style={{objectPosition: 'center', objectFit: 'contain'}} />
              </div>
              <div className="leagueDetails">
                <div className="leagueName">
                  {league.league.name}
                </div>
                <div className="countryName">
                  {league.country.flag && (
                    <div className="countryImage">
                      <Image width={15} height={15} alt="country_flag" src={league.country.flag} style={{borderRadius: '4px'}} />
                    </div>
                  )}
                  {league.country.name}
                </div>
              </div>
            </div>
            <div className="right">
              <div className="favourite-btn">
                <svg style={{ strokeWidth: 1, height: 22, width: 22, stroke: '#fff', }} viewBox="0 0 24 24"
                  className="favourite-svg">
                  <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                </svg>
              </div>
              <div className="navigation-btn">
                <ChevronRight size={20} color="#5c5c5c" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {isLoading && <p>Loading...</p>}
    </div>
  )
}

export default LeaguesComponent