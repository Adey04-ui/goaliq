"use client"

import { ChevronRight, Search } from "lucide-react"
import { useState } from "react"
import { motion } from "framer-motion"
import useSWR from "swr"
import Image from "next/image"

const fetcher = (url) => fetch(url).then((res) => res.json())

function LeaguesComponent() {
  const [filter, setFilter] = useState("topLeagues")
  const [search, setSearch] = useState("")

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
      </div>

      <div className="allLeaguesList">
        {leagues.map((league) => (
          <div className="eachList" key={league.league.id}>
            <div className="left">
              <div className="leagueImage">
                <Image width={30} height={30} alt="league_logo" src={league.league.logo} />
              </div>
              <div className="leagueDetails">
                <div className="leagueName">
                  {league.league.name}
                </div>
                <div className="countryName">
                  <div className="countryImage">
                    {league.country.flag && (
                      <Image width={15} height={15} alt="country_flag" src={league.country.flag} />
                    )}
                  </div>
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