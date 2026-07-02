"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star } from "lucide-react"
import { useFavorites } from "@/context/favoriteContext"
import { toggleFavourite } from "@/services/favourites"
import TeamOverview from "@/app/components/TeamOverview"
import TeamSquad from "@/app/components/TeamSquad"
import TeamFixtures from "@/app/components/TeamFixtures"
import TeamResults from "@/app/components/TeamResults"
import TeamStats from "@/app/components/TeamStats"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

const TABS = ["Overview", "Squad", "Fixtures", "Results", "Stats"]

export default function TeamPage() {
  const { teamId } = useParams()
  const [active, setActive] = useState("Overview")
  const { favorites, setFavorites } = useFavorites()

  // Only fetch team info on mount — lightweight, cached 30 days
  const { data: teamData, isLoading: teamLoading } = useSWR(
    `/api/teams/${teamId}`,
    fetcher
  )

  const team = teamData?.data
  const activeIndex = TABS.indexOf(active)

  const isFavourite = favorites?.team?.some(f => f.itemId === team?.team?.id)

  const handleFav = () => {
    if (!team) return
    const key = team.team.id
    const exists = isFavourite

    setFavorites(prev => {
      const list = prev.team || []
      const updated = exists
        ? list.filter(f => f.itemId !== key)
        : [...list, { itemId: key, name: team.team.name, logo: team.team.logo, type: "TEAM" }]
      return { ...prev, team: updated }
    })

    toggleFavourite({
      itemId: key,
      type: "TEAM",
      name: team.team.name,
      logo: team.team.logo,
      action: exists ? "REMOVE" : "ADD",
    })
  }

  if (teamLoading || !team) {
    return (
      <div className="teamPage">
        <div className="teamPage__headerSkeleton" />
        <div className="teamPage__tabsSkeleton" />
        <div className="teamPage__bodySkeleton" />
      </div>
    )
  }

  return (
    <div className="parent-container">
      <div className="teamPage">
        {/* Header */}
        <div className="teamPage__header">
          <div className="teamPage__headerLeft">
            <Image
              src={team.team.logo}
              alt={team.team.name}
              width={64}
              height={64}
            />
            <div className="teamPage__headerInfo">
              <h1>{team.team.name}</h1>
              <span className="teamPage__headerMeta">
                {team.team.country} · Founded {team.team.founded}
              </span>
            </div>
          </div>

          <button
            className={`teamPage__favBtn ${isFavourite ? "active" : ""}`}
            onClick={handleFav}
          >
            <Star size={18} fill={isFavourite ? "#f5a623" : "none"} />
            {isFavourite ? "Following" : "Follow"}
          </button>
        </div>

        {/* Tabs */}
        <div className="teamPage__tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className="teamPage__tab"
              onClick={() => setActive(tab)}
            >
              {tab}
              {active === tab && (
                <motion.div
                  layoutId="teamTabUnderline"
                  className="teamPage__tabUnderline"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Sliding panels — same pattern as Standings.jsx */}
        <div className="teamPage__viewport">
          <motion.div
            className="teamPage__slider"
            animate={{ x: `-${activeIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            <div className="teamPage__panel">
              <TeamOverview team={team} active={active} teamId={teamId} />
            </div>
            <div className="teamPage__panel">
              <TeamSquad teamId={teamId} active={active} />
            </div>
            <div className="teamPage__panel">
              <TeamFixtures teamId={teamId} active={active} />
            </div>
            <div className="teamPage__panel">
              <TeamResults teamId={teamId} active={active} />
            </div>
            <div className="teamPage__panel">
              <TeamStats teamId={teamId} team={team} active={active} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}