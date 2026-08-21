"use client"

import useSWR from "swr"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useUser } from "@/context/userContext"
import {useRouter} from "next/navigation"

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
        animation: "lineupShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function LineupsSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes lineupShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {/* Pitch skeleton */}
      <div style={{ background: "rgba(12,17,23,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70,82,97,0.12)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12, alignItems: "center" }}>
        <SkeletonPulse width={140} height={14} radius={6} style={{ opacity: 0.5, alignSelf: "flex-start" }} />
        <SkeletonPulse width="100%" height={320} radius={12} style={{ maxWidth: 500, opacity: 0.3 }} />
        <SkeletonPulse width={140} height={14} radius={6} style={{ opacity: 0.5, alignSelf: "flex-end" }} />
      </div>
      {/* Subs skeleton */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {Array.from({ length: 2 }).map((_, ti) => (
          <div key={ti} style={{ background: "rgba(12,17,23,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70,82,97,0.12)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 10 }}>
            <SkeletonPulse width={120} height={16} radius={6} style={{ marginBottom: 6 }} />
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <SkeletonPulse width={28} height={28} radius="50%" style={{ opacity: 0.4 }} />
                <SkeletonPulse width={`${60 + (i % 3) * 10}%`} height={14} radius={6} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function computePositions(startXI) {
  const rows = {}
  for (const p of startXI) {
    if (!p.grid) continue
    const [row, col] = p.grid.split(":").map(Number)
    if (!rows[row]) rows[row] = []
    rows[row].push({ ...p, col })
  }
  const rowKeys = Object.keys(rows).map(Number).sort((a, b) => a - b)
  const totalRows = rowKeys.length
  const positioned = []
  rowKeys.forEach((rowNum, rowIndex) => {
    const playersInRow = rows[rowNum].sort((a, b) => a.col - b.col)
    const count = playersInRow.length
    playersInRow.forEach((p, i) => {
      positioned.push({
        ...p,
        xPct: ((i + 1) / (count + 1)) * 100,
        yFraction: totalRows > 1 ? rowIndex / (totalRows - 1) : 0,
      })
    })
  })
  return positioned
}

function attachSubEvents(players, events) {
  return players.map((p) => {
    const subOff = events.find((e) => e.type === "subst" && e.player === p.name)
    const subOn = events.find((e) => e.type === "subst" && e.assist === p.name)
    return { ...p, subOffMinute: subOff ? subOff.time : null, subOnMinute: subOn ? subOn.time : null }
  })
}

function ratingColor(rating) {
  if (rating === null) return null
  if (rating >= 7.0) return "#22c55e"
  if (rating >= 6.0) return "#f5a623"
  if (rating < 6.0) return "#5c6472"
  return "#ef4444"
}

function PlayerDot({ player, x, y, labelBelow, showRating, dataSaver }) {
  const router = useRouter()
  const clipId = `clip-${player.id}`
  const badgeY = labelBelow ? -4.5 : 4.5
  return (
    <g transform={`translate(${x}, ${y})`} onClick={() => router.push(`/main/players/${player.id}`)}>
      <defs>
        <clipPath id={clipId}><circle r="3.2" /></clipPath>
      </defs>
      <circle r="3.4" fill="#1b2b3e" />
      {!dataSaver && (
        <image href={player.photo} x="-3.2" y="-3.2" width="6.4" height="6.4" clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice" />
      )}
      <circle r="3.4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      {(player.subOffMinute || player.subOnMinute) && (
        <g transform="translate(2.6, 2.6)">
          <circle r="1.3" fill={player.subOnMinute ? "#22c55e" : "#ef4444"} />
          {player.subOnMinute ? (
            <ArrowLeft x={-1} y={-1} width={2} height={2} color="#fff" strokeWidth={3} />
          ) : (
            <ArrowRight x={-1} y={-1} width={2} height={2} color="#fff" strokeWidth={3} />
          )}
        </g>
      )}
      <text textAnchor="middle" y={labelBelow ? 6 : -5} fontSize="2.4" fill="#d1d5db">{player.number}. {player.name?.split(" ").slice(-1)[0]}</text>
      {showRating && player.rating !== null && (
        <g transform="translate(-5.4, -4.7)">
          <rect width="4.2" height="2.6" rx="0.4" fill={ratingColor(player.rating)} />
          <text x="1.9" y="1.9" textAnchor="middle" fontSize="1.9" fill="#fff" fontWeight="700">{player.rating?.toFixed(1)}</text>
        </g>
      )}
      <g transform={`translate(0, ${badgeY})`}>
        {Array.from({ length: player.goals || 0 }).map((_, i) => (
          <text key={`g${i}`} x={-3 + i * 2.2} fontSize="2.2" textAnchor="middle">⚽</text>
        ))}
        {player.yellowCards > 0 && <rect x={-3 + (player.goals || 0) * 2.2} y="-1.6" width="1.4" height="2" fill="#f5c518" rx="0.2" />}
        {player.redCards > 0 && <rect x={-3 + (player.goals || 0) * 2.2 + 1.8} y="-1.6" width="1.4" height="2" fill="#ef4444" rx="0.2" />}
      </g>
    </g>
  )
}

function Pitch({ homeSide, awaySide, showRating, dataSaver }) {
  const homePositions = computePositions(homeSide.startXI)
  const awayPositions = computePositions(awaySide.startXI)
  return (
    <svg viewBox="0 0 100 160" style={{ width: "100%", maxWidth: 560, height: "auto", display: "block", margin: "0 auto" }}>
      <rect x="2" y="2" width="96" height="156" fill="none" stroke="#465261" strokeWidth="0.6" />
      <line x1="2" y1="80" x2="98" y2="80" stroke="#465261" strokeWidth="0.6" />
      <circle cx="50" cy="80" r="10" fill="none" stroke="#465261" strokeWidth="0.6" />
      <circle cx="50" cy="80" r="0.6" fill="#465261" />
      <rect x="27" y="2" width="46" height="16" fill="none" stroke="#465261" strokeWidth="0.6" />
      <rect x="38" y="2" width="24" height="6" fill="none" stroke="#465261" strokeWidth="0.6" />
      <rect x="27" y="142" width="46" height="16" fill="none" stroke="#465261" strokeWidth="0.6" />
      <rect x="38" y="152" width="24" height="6" fill="none" stroke="#465261" strokeWidth="0.6" />
      {awayPositions.map((p) => (
        <PlayerDot key={p.id} player={p} x={p.xPct} y={9 + p.yFraction * 65} labelBelow={false} showRating={showRating} dataSaver={dataSaver} />
      ))}
      {homePositions.map((p) => (
        <PlayerDot key={p.id} player={p} x={p.xPct} y={150 - p.yFraction * 63} labelBelow={true} showRating={showRating} dataSaver={dataSaver} />
      ))}
    </svg>
  )
}

function TeamSubsList({ side, showRating, dataSaver }) {
  const router = useRouter()
  console.log("side", side)
  return (
    <div style={{ backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 2 }} className="matchLineups__subs">
      <div style={{ display: "flex", alignItems: "center", gap: 10, paddingBottom: 12, borderBottom: "1px solid rgba(70, 82, 97, 0.12)", marginBottom: 8 }}>
        {!dataSaver && <Image src={side.team.logo} alt={side.team.name} width={22} height={22} style={{ objectFit: "contain" }} />}
        <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{side.team.name}</span>
        <span style={{ marginLeft: "auto", fontSize: 12, color: "#8896a8", background: "rgba(27, 43, 62, 0.6)", padding: "3px 10px", borderRadius: 8 }}>{side.formation}</span>
      </div>
      <h4 style={{ fontSize: 11, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 0.8, margin: "8px 0 6px" }}>Substitutes</h4>
      {side.substitutes.map((p) => (
        <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", fontSize: 13, color: "#d1d5db", cursor: 'pointer' }} onClick={() => router.push(`/main/players/${p.id}`)}>
          {!dataSaver && (
            <Image src={p.photo} alt="" width={26} height={26} style={{ borderRadius: "50%", objectFit: "cover", background: "rgba(255,255,255,0.06)" }} onError={(e) => { e.currentTarget.style.visibility = "hidden" }} />
          )}
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(27, 43, 62, 0.6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{p.number}</span>
          <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
          <span style={{ fontSize: 11, color: "#556677", marginLeft: "auto", paddingRight: 8 }}>{p.position}</span>
          {p.subOnMinute && <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "#22c55e", background: "rgba(34,197,94,0.1)", padding: "2px 8px", borderRadius: 6 }}><ArrowLeft size={12} />{p.subOnMinute}&apos;</span>}
          {showRating && p.rating !== null && (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: ratingColor(p.rating), padding: "2px 8px", borderRadius: 6, minWidth: 32, textAlign: "center" }}>{p.rating?.toFixed(1)}</span>
          )}
        </div>
      ))}
      {side.coach && <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(70, 82, 97, 0.12)", fontSize: 12, color: "#8896a8", cursor: 'pointer' }} onClick={() => router.push(`/main/coaches/${side.coachId}`)}>
        Coach: {side.coach}
      </div>}
    </div>
  )
}

export default function MatchLineups({ match, matchId, active }) {
  const { preferences } = useUser()
  const isActive = active === "Lineups"
  const { data, isLoading } = useSWR(isActive ? `/api/matches/${matchId}/lineups?status=${match.status}` : null, fetcher)
  const { data: eventsData } = useSWR(
    isActive && match.status !== "UPCOMING" ? `/api/matches/${matchId}/events?status=${match.status}` : null,
    fetcher,
    { refreshInterval: match.status === "LIVE" ? 30000 : 0 }
  )

  const lineups = data?.data
  const events = eventsData?.data || []

  if (isLoading) return <LineupsSkeleton />
  if (!lineups) return <div style={{ textAlign: "center", padding: "40px 0", color: "#556677", fontSize: 13 }}>{data?.message || "Lineups not available"}</div>

  const rawHomeSide = lineups.find((s) => s.team.id === match.teams.home.id)
  const rawAwaySide = lineups.find((s) => s.team.id === match.teams.away.id)

  const homeSide = { ...rawHomeSide, startXI: attachSubEvents(rawHomeSide.startXI, events), substitutes: attachSubEvents(rawHomeSide.substitutes, events) }
  const awaySide = { ...rawAwaySide, startXI: attachSubEvents(rawAwaySide.startXI, events), substitutes: attachSubEvents(rawAwaySide.substitutes, events) }

  const showRating = preferences?.showPlayerRatings ?? true
  const dataSaver = preferences?.dataSaver ?? false

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#d1d5db" }}>
          {!dataSaver && <Image src={awaySide.team.logo} alt={awaySide.team.name} width={18} height={18} style={{ objectFit: "contain" }} />}
          <span>{awaySide.team.name} · {awaySide.formation}</span>
        </div>
        <Pitch homeSide={homeSide} awaySide={awaySide} showRating={showRating} dataSaver={dataSaver} />
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600, color: "#d1d5db", justifyContent: "flex-end" }}>
          {!dataSaver && <Image src={homeSide.team.logo} alt={homeSide.team.name} width={18} height={18} style={{ objectFit: "contain" }} />}
          <span>{homeSide.team.name} · {homeSide.formation}</span>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <TeamSubsList side={homeSide} showRating={showRating} dataSaver={dataSaver} />
        <TeamSubsList side={awaySide} showRating={showRating} dataSaver={dataSaver} />
      </div>
    </motion.div>
  )
}