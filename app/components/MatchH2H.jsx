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
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes h2hShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ background: "rgba(12,17,23,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70,82,97,0.12)", borderRadius: 16, padding: 24, display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        <SkeletonPulse width={80} height={20} radius={6} style={{ opacity: 0.5 }} />
        <SkeletonPulse width={60} height={20} radius={6} style={{ opacity: 0.4 }} />
        <SkeletonPulse width={80} height={20} radius={6} style={{ opacity: 0.5 }} />
      </div>
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} style={{ background: "rgba(12,17,23,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70,82,97,0.12)", borderRadius: 14, padding: "14px 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
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
    return (
      <div style={{ textAlign: "center", padding: "40px 0", color: "#556677", fontSize: 13 }}>
        No previous meetings found
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Record */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "22px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#3b82f6" }}>
          {!dataSaver && <Image src={match.teams.home.logo} alt={match.teams.home.name} width={22} height={22} style={{ objectFit: "contain" }} />}
          <span>{h2h.record.homeWins} Wins</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#8896a8" }}>{h2h.record.draws} Draws</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 700, color: "#ef4444" }}>
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
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "14px 20px",
            background: "rgba(12, 17, 23, 0.5)",
            backdropFilter: "blur(8px)",
            border: "1px solid rgba(70, 82, 97, 0.12)",
            borderRadius: 14,
            fontSize: 13,
          }}
        >
          <span style={{ color: "#556677", fontSize: 12, flexShrink: 0, minWidth: 70 }}>{new Date(m.date).toLocaleDateString()}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "center", flexWrap: "wrap" }}>
            {!dataSaver && <Image src={m.teams.home.logo} alt="" width={18} height={18} style={{ objectFit: "contain" }} />}
            <span style={{ color: "#d1d5db", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{m.teams.home.name}</span>
            <span style={{ fontWeight: 800, color: "#fff", fontSize: 15, margin: "0 6px", minWidth: 36, textAlign: "center" }}>{m.goals.home} - {m.goals.away}</span>
            <span style={{ color: "#d1d5db", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 120 }}>{m.teams.away.name}</span>
            {!dataSaver && <Image src={m.teams.away.logo} alt="" width={18} height={18} style={{ objectFit: "contain" }} />}
          </div>
          <span style={{ color: "#556677", fontSize: 11, flexShrink: 0, minWidth: 80, textAlign: "right" }}>{m.league}</span>
        </motion.div>
      ))}
    </motion.div>
  )
}