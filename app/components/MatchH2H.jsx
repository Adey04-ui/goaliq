"use client"

import useSWR from "swr"
import Image from "next/image"
import { motion } from "framer-motion"
import { useUser } from "@/context/userContext"

const fetcher = (url) => fetch(url).then((res) => res.json())

function SkeletonPulse({ width, height, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
        backgroundSize: "200% 100%",
        animation: "h2hShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function H2HSkeleton() {
  return (
    <div className="matchH2H">
      <style>{`@keyframes h2hShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div className="matchH2H__recordBar">
        <SkeletonPulse width={80} height={20} radius={6} style={{ opacity: 0.5 }} />
        <SkeletonPulse width={60} height={20} radius={6} style={{ opacity: 0.4 }} />
        <SkeletonPulse width={80} height={20} radius={6} style={{ opacity: 0.5 }} />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="matchH2H__row">
          <SkeletonPulse width={70} height={12} radius={6} style={{ opacity: 0.35 }} />
          <SkeletonPulse width="50%" height={14} radius={6} style={{ opacity: 0.5 }} />
          <SkeletonPulse width={60} height={12} radius={6} style={{ opacity: 0.35 }} />
        </div>
      ))}
    </div>
  )
}

export default function MatchH2H({ match, matchId, active }) {
  const { preferences } = useUser()
  const dataSaver = preferences?.dataSaver ?? false

  const { data, isLoading } = useSWR(
    active === "H2H" ? `/api/matches/${matchId}/h2h?home=${match.teams.home.id}&away=${match.teams.away.id}` : null,
    fetcher
  )

  const h2h = data?.data

  if (isLoading) return <H2HSkeleton />

  if (!h2h || h2h.meetings.length === 0) {
    return <div className="matchEmpty">No previous meetings found</div>
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="matchH2H">
      {/* Record */}
      <div className="matchH2H__recordBar">
        <div className="matchH2H__recordItem matchH2H__recordItem--home">
          {!dataSaver && <Image src={match.teams.home.logo} alt={match.teams.home.name} width={22} height={22} style={{ objectFit: "contain" }} />}
          <span>{h2h.record.homeWins} Wins</span>
        </div>
        <div className="matchH2H__recordItem matchH2H__recordItem--draw">{h2h.record.draws} Draws</div>
        <div className="matchH2H__recordItem matchH2H__recordItem--away">
          <span>{h2h.record.awayWins} Wins</span>
          {!dataSaver && <Image src={match.teams.away.logo} alt={match.teams.away.name} width={22} height={22} style={{ objectFit: "contain" }} />}
        </div>
      </div>

      {/* Meetings */}
      {h2h.meetings.map((m, i) => (
        <motion.div
          key={m.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04, duration: 0.25 }}
          className="matchH2H__row"
        >
          <span className="matchH2H__date">{new Date(m.date).toLocaleDateString()}</span>
          <div className="matchH2H__teams">
            {!dataSaver && <Image src={m.teams.home.logo} alt="" width={18} height={18} style={{ objectFit: "contain" }} />}
            <span className="matchH2H__teamName">{m.teams.home.name}</span>
            <span className="matchH2H__score">{m.goals.home} - {m.goals.away}</span>
            <span className="matchH2H__teamName">{m.teams.away.name}</span>
            {!dataSaver && <Image src={m.teams.away.logo} alt="" width={18} height={18} style={{ objectFit: "contain" }} />}
          </div>
          <span className="matchH2H__league">{m.league}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}
