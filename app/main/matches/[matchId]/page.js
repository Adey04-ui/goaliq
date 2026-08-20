"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import useSWR from "swr"
import Image from "next/image"
import { motion, AnimatePresence } from "framer-motion"
import MatchOverview from "@/app/components/MatchOverview"
import MatchLineups from "@/app/components/MatchLineups"
import MatchStats from "@/app/components/MatchStats"
import MatchH2H from "@/app/components/MatchH2H"
import MatchStandings from "@/app/components/MatchStandings"
import { useFormatMatchTime, useFormatDate } from "@/lib/preferences"
import { useUser } from "@/context/userContext"
import { MapPin, UserCheck } from "lucide-react"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

const TABS = ["Overview", "Lineups", "Stats", "H2H", "Standings"]

function MatchPageSkeleton() {
  return (
    <div className="matchPage">
      <div className="matchPage__header matchPage__headerSkeleton" />
      <div className="matchPage__tabs matchPage__tabsSkeleton" />
      <div className="matchPage__bodySkeleton" />
    </div>
  )
}

export default function MatchPage() {
  const { matchId } = useParams()
  const [active, setActive] = useState("Overview")
  const { preferences } = useUser()
  const dataSaver = preferences?.dataSaver ?? false
  const router = useRouter()

  const { data: matchData, isLoading: matchLoading } = useSWR(`/api/matches/${matchId}`, fetcher, {
    refreshInterval: 30000,
  })

  const match = matchData?.data
  const activeIndex = TABS.indexOf(active)

  const formatMatchTime = useFormatMatchTime()
  const formatDate = useFormatDate()

  if (matchLoading || !match) {
    return (
      <div className="parent-container">
        <MatchPageSkeleton />
      </div>
    )
  }

  const isLive = match.status === "LIVE"
  const isFinished = match.status === "FINISHED"
  const matchDate = match.fixture?.date ?? match.date

  return (
    <div className="parent-container">
      <div className="matchPage">
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="matchPage__header"
        >
          <div className="matchPage__league">
            {!dataSaver && (
              <Image src={match.league.logo} alt={match.league.name} width={20} height={20} />
            )}
            <span>{match.league.name} · {match.league.round || "Matchday"}</span>
          </div>

          <div className="matchPage__scoreboard">
            <div className="matchPage__team" onClick={() => router.push(`/main/team/${match.teams.home.id}`)}>
              {!dataSaver ? (
                <Image src={match.teams.home.logo} alt={match.teams.home.name} width={64} height={64} className="matchPage__teamLogo" />
              ) : (
                <div className="matchPage__teamPlaceholder">{match.teams.home.name?.charAt(0)}</div>
              )}
              <span className="matchPage__teamName">{match.teams.home.name}</span>
            </div>

            <div className="matchPage__center">
              {isLive || isFinished ? (
                <>
                  <span className="matchPage__score">
                    {match.goals.home} - {match.goals.away}
                  </span>
                  <span className={`matchPage__status ${isLive ? "matchPage__status--live" : "matchPage__status--finished"}`}>
                    {isLive ? `${match.elapsed || match.fixture?.status?.elapsed || 0}' LIVE` : "Full Time"}
                  </span>
                </>
              ) : (
                <>
                  <span className="matchPage__time">{formatMatchTime(matchDate) ?? "--:--"}</span>
                  <span className="matchPage__date">
                    {formatDate(matchDate, { weekday: "short", month: "short", day: "numeric" }) ?? "TBD"}
                  </span>
                </>
              )}
            </div>

            <div className="matchPage__team" onClick={() => router.push(`/main/team/${match.teams.away.id}`)}>
              {!dataSaver ? (
                <Image src={match.teams.away.logo} alt={match.teams.away.name} width={64} height={64} className="matchPage__teamLogo" />
              ) : (
                <div className="matchPage__teamPlaceholder">{match.teams.away.name?.charAt(0)}</div>
              )}
              <span className="matchPage__teamName">{match.teams.away.name}</span>
            </div>
          </div>

          <div className="matchPage__meta">
            {match.venue?.name && (
              <span className="matchPage__metaItem">
                <MapPin size={13} /> {match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ""}
              </span>
            )}
            {match.referee && (
              <span className="matchPage__metaItem">
                <UserCheck size={13} /> Ref: {match.referee}
              </span>
            )}
          </div>
        </motion.div>

        {/* ─── Tabs ─── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="matchPage__tabs"
        >
          {TABS.map((tab) => {
            const isActive = active === tab
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                className={`matchPage__tab ${isActive ? "matchPage__tab--active" : ""}`}
              >
                {isActive && (
                  <motion.div layoutId="matchTabBg" className="matchPage__tabBg" transition={{ type: "spring", bounce: 0.18, duration: 0.5 }} />
                )}
                {tab}
              </button>
            )
          })}
        </motion.div>

        {/* ─── Panels ─── */}
        <div className="matchPage__panels">
          <motion.div
            className="matchPage__panelTrack"
            animate={{ x: `-${activeIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            {TABS.map((tab) => (
              <div key={tab} className="matchPage__panel">
                <AnimatePresence mode="wait">
                  {active === tab && (
                    <motion.div
                      key={tab}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.25 }}
                    >
                      {tab === "Overview" && <MatchOverview match={match} active={active} matchId={matchId} />}
                      {tab === "Lineups" && <MatchLineups match={match} active={active} matchId={matchId} />}
                      {tab === "Stats" && <MatchStats match={match} active={active} matchId={matchId} />}
                      {tab === "H2H" && <MatchH2H match={match} active={active} matchId={matchId} />}
                      {tab === "Standings" && <MatchStandings match={match} active={active} matchId={matchId} />}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
}