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
        animation: "standingsShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function StandingsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <style>{`@keyframes standingsShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: "1px solid var(--border-glass)" }}>
        <SkeletonPulse width={24} height={12} radius={4} style={{ opacity: 0.4 }} />
        <SkeletonPulse width="45%" height={12} radius={4} style={{ opacity: 0.4 }} />
        <SkeletonPulse width={30} height={12} radius={4} style={{ opacity: 0.4, marginLeft: "auto" }} />
        <SkeletonPulse width={30} height={12} radius={4} style={{ opacity: 0.4 }} />
        <SkeletonPulse width={30} height={12} radius={4} style={{ opacity: 0.4 }} />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid var(--border-glass-subtle)" }}>
          <SkeletonPulse width={20} height={14} radius={4} style={{ opacity: 0.35 }} />
          <SkeletonPulse width={22} height={22} radius="50%" style={{ opacity: 0.4 }} />
          <SkeletonPulse width={`${40 + (i % 3) * 15}%`} height={14} radius={6} />
          <SkeletonPulse width={24} height={12} radius={4} style={{ opacity: 0.3, marginLeft: "auto" }} />
          <SkeletonPulse width={24} height={12} radius={4} style={{ opacity: 0.3 }} />
          <SkeletonPulse width={24} height={12} radius={4} style={{ opacity: 0.3 }} />
        </div>
      ))}
    </div>
  )
}

export default function MatchStandings({ match, matchId, active }) {
  const { preferences } = useUser()
  const dataSaver = preferences?.dataSaver ?? false

  const { data, isLoading } = useSWR(
    active === "Standings" ? `/api/matches/${matchId}/standings?league=${match.league.id}&season=${match.league.season}` : null,
    fetcher
  )

  const groups = data?.data

  if (isLoading) return <StandingsSkeleton />

  if (!groups || groups.length === 0) {
    return <div className="matchEmpty">Standings not available for this competition</div>
  }

  const homeId = match.teams.home.id
  const awayId = match.teams.away.id

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="matchStandings">
      {groups.map((group, gi) => (
        <div key={gi} className="matchStandings__group">
          {/* Table Header */}
          <div className="matchStandings__header">
            <span>#</span>
            <span>Team</span>
            <span className="matchStandings__headerCell">P</span>
            <span className="matchStandings__headerCell">W</span>
            <span className="matchStandings__headerCell">D</span>
            <span className="matchStandings__headerCell">L</span>
            <span className="matchStandings__headerCell">GD</span>
            <span className="matchStandings__headerCell--right">Pts</span>
          </div>

          {/* Rows */}
          {group.map((row, i) => {
            const isMatchTeam = row.team.id === homeId || row.team.id === awayId
            const rankClass = row.rank <= 3 ? "matchStandings__rank--top" : row.rank >= 18 ? "matchStandings__rank--bottom" : "matchStandings__rank--mid"
            const gdClass = row.goalsDiff > 0 ? "matchStandings__gd--pos" : row.goalsDiff < 0 ? "matchStandings__gd--neg" : "matchStandings__gd--zero"
            return (
              <motion.div
                key={row.team.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                className={`matchStandings__row ${isMatchTeam ? "matchStandings__row--highlight" : ""}`}
              >
                <span className={`matchStandings__rank ${rankClass}`}>{row.rank}</span>
                <div className="matchStandings__team">
                  {!dataSaver && <Image src={row.team.logo} alt={row.team.name} width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} />}
                  <span className={`matchStandings__teamName ${isMatchTeam ? "matchStandings__teamName--highlight" : ""}`}>{row.team.name}</span>
                </div>
                <span className="matchStandings__cell">{row.played}</span>
                <span className="matchStandings__cell">{row.win}</span>
                <span className="matchStandings__cell">{row.draw}</span>
                <span className="matchStandings__cell">{row.lose}</span>
                <span className={`matchStandings__gd ${gdClass}`}>{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</span>
                <span className="matchStandings__pts">{row.points}</span>
              </motion.div>
            )
          })}
        </div>
      ))}
    </motion.div>
  )
}
