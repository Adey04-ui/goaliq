"use client"

import { useState } from "react"
import { useParams } from "next/navigation"
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
import {useRouter} from "next/navigation"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

const TABS = ["Overview", "Lineups", "Stats", "H2H", "Standings"]

function SkeletonPulse({ width, height, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
        backgroundSize: "200% 100%",
        animation: "matchSkeletonShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function MatchPageSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <style>{`
        @keyframes matchSkeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      {/* Header skeleton */}
      <div
        style={{
          width: "100%",
          background: "rgba(12, 17, 23, 0.7)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(70, 82, 97, 0.18)",
          borderRadius: 20,
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <SkeletonPulse width={180} height={16} radius={6} style={{ opacity: 0.5 }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1 }}>
            <SkeletonPulse width={56} height={56} radius={12} />
            <SkeletonPulse width={120} height={14} radius={6} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, minWidth: 120 }}>
            <SkeletonPulse width={80} height={36} radius={8} />
            <SkeletonPulse width={60} height={14} radius={6} style={{ opacity: 0.4 }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1 }}>
            <SkeletonPulse width={56} height={56} radius={12} />
            <SkeletonPulse width={120} height={14} radius={6} />
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 24, paddingTop: 12, borderTop: "1px solid rgba(70, 82, 97, 0.12)" }}>
          <SkeletonPulse width={140} height={12} radius={6} style={{ opacity: 0.35 }} />
          <SkeletonPulse width={100} height={12} radius={6} style={{ opacity: 0.35 }} />
        </div>
      </div>

      {/* Tabs skeleton */}
      <div style={{ display: "flex", gap: 4, padding: "4px", background: "rgba(27, 43, 62, 0.5)", borderRadius: 14, width: "fit-content", border: "1px solid rgba(70, 82, 97, 0.3)" }}>
        {TABS.map((_, i) => (
          <SkeletonPulse key={i} width={80} height={34} radius={10} style={{ opacity: 0.3 + (i % 2) * 0.1 }} />
        ))}
      </div>

      {/* Body skeleton */}
      <div
        style={{
          width: "100%",
          background: "rgba(12, 17, 23, 0.5)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(70, 82, 97, 0.12)",
          borderRadius: 20,
          padding: 28,
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <SkeletonPulse width="40%" height={18} radius={6} />
        <SkeletonPulse width="100%" height={52} radius={12} style={{ opacity: 0.4 }} />
        <SkeletonPulse width="100%" height={52} radius={12} style={{ opacity: 0.35 }} />
        <SkeletonPulse width="100%" height={52} radius={12} style={{ opacity: 0.3 }} />
        <SkeletonPulse width="100%" height={52} radius={12} style={{ opacity: 0.25 }} />
      </div>
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
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* ─── Header ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          style={{
            width: "100%",
            background: "rgba(12, 17, 23, 0.7)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(70, 82, 97, 0.18)",
            borderRadius: 20,
            padding: "24px 28px",
            display: "flex",
            flexDirection: "column",
            gap: 20,
            boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
          }}
        >
          {/* League */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "#8896a8", fontWeight: 500 }}>
            {!dataSaver && (
              <Image src={match.league.logo} alt={match.league.name} width={20} height={20} style={{ borderRadius: 4, objectFit: "contain" }} />
            )}
            <span>{match.league.name} · {match.league.round || "Matchday"}</span>
          </div>

          {/* Scoreboard */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {/* Home */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, minWidth: 100, cursor: 'pointer' }} onClick={()=> router.push(`/main/team/${match.teams.home.id}`)}>
              {!dataSaver ? (
                <Image src={match.teams.home.logo} alt={match.teams.home.name} width={64} height={64} style={{ objectFit: "contain" }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 14, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#8896a8" }}>
                  {match.teams.home.name?.charAt(0)}
                </div>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>
                {match.teams.home.name}
              </span>
            </div>

            {/* Center */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 120 }}>
              {isLive || isFinished ? (
                <>
                  <span style={{ fontSize: 42, fontWeight: 800, color: "#fff", letterSpacing: 2, lineHeight: 1 }}>
                    {match.goals.home} - {match.goals.away}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      color: isLive ? "#ef4444" : "#8896a8",
                      padding: "4px 10px",
                      borderRadius: 20,
                      background: isLive ? "rgba(239,68,68,0.12)" : "transparent",
                    }}
                  >
                    {isLive ? `${match.elapsed || match.fixture?.status?.elapsed || 0}' LIVE` : "Full Time"}
                  </span>
                </>
              ) : (
                <>
                  <span style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1 }}>
                    {formatMatchTime(matchDate) ?? "--:--"}
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 500, color: "#8896a8", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {formatDate(matchDate, { weekday: "short", month: "short", day: "numeric" }) ?? "TBD"}
                  </span>
                </>
              )}
            </div>

            {/* Away */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, flex: 1, minWidth: 100, cursor: 'pointer' }} onClick={() => router.push(`/main/team/${match.teams.away.id}`)}>
              {!dataSaver ? (
                <Image src={match.teams.away.logo} alt={match.teams.away.name} width={64} height={64} style={{ objectFit: "contain" }} />
              ) : (
                <div style={{ width: 64, height: 64, borderRadius: 14, background: "rgba(255,255,255,0.06)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, fontWeight: 700, color: "#8896a8" }}>
                  {match.teams.away.name?.charAt(0)}
                </div>
              )}
              <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", textAlign: "center", lineHeight: 1.3 }}>
                {match.teams.away.name}
              </span>
            </div>
          </div>

          {/* Meta */}
          <div style={{ display: "flex", justifyContent: "center", gap: 24, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid rgba(70, 82, 97, 0.12)", fontSize: 12, color: "#556677" }}>
            {match.venue?.name && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <MapPin size={13} /> {match.venue.name}{match.venue.city ? `, ${match.venue.city}` : ""}
              </span>
            )}
            {match.referee && (
              <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
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
          style={{
            display: "inline-flex",
            background: "rgba(27, 43, 62, 0.5)",
            backdropFilter: "blur(8px)",
            borderRadius: 14,
            padding: 4,
            gap: 4,
            border: "1px solid rgba(70, 82, 97, 0.3)",
            width: "fit-content",
          }}
        >
          {TABS.map((tab) => {
            const isActive = active === tab
            return (
              <button
                key={tab}
                onClick={() => setActive(tab)}
                style={{
                  position: "relative",
                  padding: "8px 18px",
                  borderRadius: 10,
                  border: "none",
                  background: "transparent",
                  color: isActive ? "#fff" : "#8896a8",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                  zIndex: 1,
                  transition: "color 0.2s ease",
                  textTransform: "capitalize",
                  letterSpacing: "0.2px",
                  whiteSpace: "nowrap",
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="matchTabBg"
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "#1b3a5c",
                      borderRadius: 10,
                      zIndex: -1,
                    }}
                    transition={{ type: "spring", bounce: 0.18, duration: 0.5 }}
                  />
                )}
                {tab}
              </button>
            )
          })}
        </motion.div>

        {/* ─── Panels ─── */}
        <div style={{ overflow: "hidden", width: "100%" }}>
          <motion.div
            style={{ display: "flex", width: "100%" }}
            animate={{ x: `-${activeIndex * 100}%` }}
            transition={{ type: "spring", stiffness: 250, damping: 30 }}
          >
            {TABS.map((tab) => (
              <div key={tab} style={{ minWidth: "100%", width: "100%", paddingRight: 4 }}>
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