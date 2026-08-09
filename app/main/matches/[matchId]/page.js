"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
import useSWR from "swr"
import Image from "next/image"
import { motion } from "framer-motion"
import MatchOverview from "@/app/components/MatchOverview"
import MatchLineups from "@/app/components/MatchLineups"
import MatchStats from "@/app/components/MatchStats"
import MatchH2H from "@/app/components/MatchH2H"
import MatchStandings from "@/app/components/MatchStandings"
import { useFormatMatchTime, useFormatDate } from "@/lib/preferences"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

const TABS = ["Overview", "Lineups", "Stats", "H2H", "Standings"]

export default function MatchPage() {
  const { matchId } = useParams()
  const [active, setActive] = useState("Overview")

  const { data: matchData, isLoading: matchLoading } = useSWR(`/api/matches/${matchId}`, fetcher, {
    refreshInterval: 30000, // core info incl. score/status refreshes fast, cheap since it's Redis-cached server-side
  })

  const match = matchData?.data
  const activeIndex = TABS.indexOf(active)

  const formatMatchTime = useFormatMatchTime()
  const formatDate = useFormatDate()

  if (matchLoading || !match) {
    return (
      <div className="parent-container">
        <div className="teamPage">
          <div className="teamPage__headerSkeleton" />
          <div className="teamPage__tabsSkeleton" />
          <div className="teamPage__bodySkeleton" />
        </div>
      </div>
    )
  }

  const isLive = match.status === "LIVE"
  const isFinished = match.status === "FINISHED"

  return (
    <div className="parent-container">
      <div className="teamPage">
        {/* Header */}
        <div className="matchPage__header">
          <div className="matchPage__league">
            <Image src={match.league.logo} alt={match.league.name} width={20} height={20} />
            <span>{match.league.name} · {match.league.round}</span>
          </div>

          <div className="matchPage__scoreboard">
            <div className="matchPage__team">
              <Image src={match.teams.home.logo} alt={match.teams.home.name} width={56} height={56} />
              <span>{match.teams.home.name}</span>
            </div>

            <div className="matchPage__center">
              {isLive || isFinished ? (
                <>
                  <div className="matchPage__score">
                    {match.goals.home} - {match.goals.away}
                  </div>
                  <div className={`matchPage__status ${isLive ? "live" : ""}`}>
                    {isLive ? `${match.elapsed}'` : "Full Time"}
                  </div>
                </>
              ) : (
                <>
                  <div className="matchPage__kickoffTime">{formatMatchTime(match.date)}</div>
                  <div className="matchPage__status">
                    {formatDate(match.date, { weekday: "short", month: "short", day: "numeric" })}
                  </div>
                </>
              )}
            </div>

            <div className="matchPage__team">
              <Image src={match.teams.away.logo} alt={match.teams.away.name} width={56} height={56} />
              <span>{match.teams.away.name}</span>
            </div>
          </div>

          <div className="matchPage__meta">
            {match.venue.name && <span>{match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ""}</span>}
            {match.referee && <span>Referee: {match.referee}</span>}
          </div>
        </div>

        {/* Tabs */}
        <div className="teamPage__tabs">
          {TABS.map((tab) => (
            <button key={tab} className="teamPage__tab" onClick={() => setActive(tab)}>
              {tab}
              {active === tab && (
                <motion.div
                  layoutId="matchTabUnderline"
                  className="teamPage__tabUnderline"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Sliding panels — same pattern as TeamPage */}
        <div className="teamPage__viewport">
          <motion.div
            className="teamPage__slider"
            animate={{ x: `-${activeIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            <div className="teamPage__panel">
              <MatchOverview match={match} active={active} matchId={matchId} />
            </div>
            <div className="teamPage__panel">
              <MatchLineups match={match} active={active} matchId={matchId} />
            </div>
            <div className="teamPage__panel">
              <MatchStats match={match} active={active} matchId={matchId} />
            </div>
            <div className="teamPage__panel">
              <MatchH2H match={match} active={active} matchId={matchId} />
            </div>
            <div className="teamPage__panel">
              <MatchStandings match={match} active={active} matchId={matchId} />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
