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
      <div style={{ display: "flex", gap: 8, padding: "10px 16px", borderBottom: "1px solid rgba(70, 82, 97, 0.12)" }}>
        <SkeletonPulse width={24} height={12} radius={4} style={{ opacity: 0.4 }} />
        <SkeletonPulse width="45%" height={12} radius={4} style={{ opacity: 0.4 }} />
        <SkeletonPulse width={30} height={12} radius={4} style={{ opacity: 0.4, marginLeft: "auto" }} />
        <SkeletonPulse width={30} height={12} radius={4} style={{ opacity: 0.4 }} />
        <SkeletonPulse width={30} height={12} radius={4} style={{ opacity: 0.4 }} />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 16px", borderBottom: "1px solid rgba(70, 82, 97, 0.08)" }}>
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
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#556677", fontSize: 13 }}>
        Standings not available for this competition
      </div>
    )
  }

  const homeId = match.teams.home.id
  const awayId = match.teams.away.id

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {groups.map((group, gi) => (
        <div key={gi} style={{ background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, overflow: "hidden" }}>
          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "32px 1fr 36px 36px 36px 36px 44px 44px", alignItems: "center", padding: "12px 20px", borderBottom: "1px solid rgba(70, 82, 97, 0.12)", fontSize: 11, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 0.8 }}>
            <span>#</span>
            <span>Team</span>
            <span style={{ textAlign: "center" }}>P</span>
            <span style={{ textAlign: "center" }}>W</span>
            <span style={{ textAlign: "center" }}>D</span>
            <span style={{ textAlign: "center" }}>L</span>
            <span style={{ textAlign: "center" }}>GD</span>
            <span style={{ textAlign: "right" }}>Pts</span>
          </div>

          {/* Rows */}
          {group.map((row, i) => {
            const isMatchTeam = row.team.id === homeId || row.team.id === awayId
            return (
              <motion.div
                key={row.team.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 36px 36px 36px 36px 44px 44px",
                  alignItems: "center",
                  padding: "10px 20px",
                  borderBottom: i < group.length - 1 ? "1px solid rgba(70, 82, 97, 0.06)" : "none",
                  background: isMatchTeam ? "rgba(59, 130, 246, 0.06)" : "transparent",
                  cursor: "pointer",
                }}
                whileHover={{ backgroundColor: "rgba(27, 43, 62, 0.4)" }}
              >
                <span style={{ fontSize: 13, fontWeight: 700, color: row.rank <= 3 ? "#fbbf24" : row.rank >= 18 ? "#ef4444" : "#8896a8" }}>{row.rank}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0 }}>
                  {!dataSaver && <Image src={row.team.logo} alt={row.team.name} width={20} height={20} style={{ objectFit: "contain", flexShrink: 0 }} />}
                  <span style={{ fontSize: 13, fontWeight: isMatchTeam ? 700 : 500, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.team.name}</span>
                </div>
                <span style={{ fontSize: 12, color: "#8896a8", textAlign: "center" }}>{row.played}</span>
                <span style={{ fontSize: 12, color: "#8896a8", textAlign: "center" }}>{row.win}</span>
                <span style={{ fontSize: 12, color: "#8896a8", textAlign: "center" }}>{row.draw}</span>
                <span style={{ fontSize: 12, color: "#8896a8", textAlign: "center" }}>{row.lose}</span>
                <span style={{ fontSize: 12, color: row.goalsDiff > 0 ? "#22c55e" : row.goalsDiff < 0 ? "#ef4444" : "#8896a8", textAlign: "center", fontWeight: 600 }}>{row.goalsDiff > 0 ? `+${row.goalsDiff}` : row.goalsDiff}</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", textAlign: "right" }}>{row.points}</span>
              </motion.div>
            )
          })}
        </div>
      ))}
    </motion.div>
  )
}