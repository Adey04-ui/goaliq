"use client"

import useSWR from "swr"
import Image from "next/image"
import { motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useUser } from "@/context/userContext"
import { useRouter } from "next/navigation"

const fetcher = (url) => fetch(url).then((res) => res.json())

function LineupsSkeleton() {
  return (
    <div className="matchLineups">
      <div className="matchLineups__pitchWrap">
        <div className="matchLineups__skeleton matchLineups__skeleton--label" />
        <div className="matchLineups__skeleton matchLineups__skeleton--pitch" />
        <div className="matchLineups__skeleton matchLineups__skeleton--label" />
      </div>
      <div className="matchLineups__subs">
        {Array.from({ length: 2 }).map((_, ti) => (
          <div key={ti} className="matchLineups__skeleton matchLineups__skeleton--card" />
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
  if (rating >= 7.0) return "var(--accent-green)"
  if (rating >= 6.0) return "var(--accent-orange)"
  if (rating < 6.0) return "var(--text-muted)"
  return "var(--accent-red)"
}

function PlayerDot({ player, x, y, labelBelow, showRating, dataSaver }) {
  const router = useRouter()
  const clipId = `clip-${player.id}`
  const badgeY = labelBelow ? -4.5 : 4.5
  return (
    <g transform={`translate(${x}, ${y})`} onClick={() => router.push(`/main/players/${player.id}`)} style={{ cursor: "pointer" }}>
      <defs>
        <clipPath id={clipId}><circle r="3.2" /></clipPath>
      </defs>
      <circle r="3.4" fill="var(--bg-hover)" />
      {!dataSaver && (
        <image href={player.photo} x="-3.2" y="-3.2" width="6.4" height="6.4" clipPath={`url(#${clipId})`} preserveAspectRatio="xMidYMid slice" />
      )}
      <circle r="3.4" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
      {(player.subOffMinute || player.subOnMinute) && (
        <g transform="translate(2.6, 2.6)">
          <circle r="1.3" fill={player.subOnMinute ? "var(--accent-green)" : "var(--accent-red)"} />
          {player.subOnMinute ? (
            <ArrowLeft x={-1} y={-1} width={2} height={2} color="#fff" strokeWidth={3} />
          ) : (
            <ArrowRight x={-1} y={-1} width={2} height={2} color="#fff" strokeWidth={3} />
          )}
        </g>
      )}
      <text textAnchor="middle" y={labelBelow ? 6 : -5} fontSize="2.4" fill="var(--text-secondary)">{player.number}. {player.name?.split(" ").slice(-1)[0]}</text>
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
        {player.yellowCards > 0 && <rect x={-3 + (player.goals || 0) * 2.2} y="-1.6" width="1.4" height="2" fill="var(--accent-gold)" rx="0.2" />}
        {player.redCards > 0 && <rect x={-3 + (player.goals || 0) * 2.2 + 1.8} y="-1.6" width="1.4" height="2" fill="var(--accent-red)" rx="0.2" />}
      </g>
    </g>
  )
}

function Pitch({ homeSide, awaySide, showRating, dataSaver }) {
  const homePositions = computePositions(homeSide.startXI)
  const awayPositions = computePositions(awaySide.startXI)
  return (
    <svg viewBox="0 0 100 160" className="matchLineups__pitch">
      <rect x="2" y="2" width="96" height="156" fill="none" stroke="var(--border-light)" strokeWidth="0.6" />
      <line x1="2" y1="80" x2="98" y2="80" stroke="var(--border-light)" strokeWidth="0.6" />
      <circle cx="50" cy="80" r="10" fill="none" stroke="var(--border-light)" strokeWidth="0.6" />
      <circle cx="50" cy="80" r="0.6" fill="var(--border-light)" />
      <rect x="27" y="2" width="46" height="16" fill="none" stroke="var(--border-light)" strokeWidth="0.6" />
      <rect x="38" y="2" width="24" height="6" fill="none" stroke="var(--border-light)" strokeWidth="0.6" />
      <rect x="27" y="142" width="46" height="16" fill="none" stroke="var(--border-light)" strokeWidth="0.6" />
      <rect x="38" y="152" width="24" height="6" fill="none" stroke="var(--border-light)" strokeWidth="0.6" />
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
  const coachHasId = Boolean(side.coach?.id)

  return (
    <div className="matchLineups__subsCard">
      <div className="matchLineups__subsHeader">
        {!dataSaver && <Image src={side.team.logo} alt={side.team.name} width={22} height={22} />}
        <span className="matchLineups__subsTitle">{side.team.name}</span>
        <span className="matchLineups__formation">{side.formation}</span>
      </div>

      <h4 className="matchOverview__cardTitle">Substitutes</h4>

      {side.substitutes.map((p) => (
        <div
          key={p.id}
          className="matchLineups__subItem"
          style={{ cursor: "pointer" }}
          onClick={() => router.push(`/main/players/${p.id}`)}
        >
          {!dataSaver && (
            <Image
              src={p.photo}
              alt=""
              width={26}
              height={26}
              style={{ borderRadius: "50%", objectFit: "cover", background: "var(--bg-hover)" }}
              onError={(e) => { e.currentTarget.style.visibility = "hidden" }}
            />
          )}
          <span className="matchLineups__number">{p.number}</span>
          <span className="matchLineups__playerName">{p.name}</span>
          <span className="matchLineups__position">{p.position}</span>
          {p.subOnMinute && (
            <span className="matchLineups__subOn">
              <ArrowLeft size={12} />{p.subOnMinute}&apos;
            </span>
          )}
          {showRating && p.rating !== null && (
            <span className="matchLineups__rating" style={{ background: ratingColor(p.rating) }}>
              {p.rating?.toFixed(1)}
            </span>
          )}
        </div>
      ))}

      {side.coach && (
        <div
          className={`matchLineups__coach ${coachHasId ? "matchLineups__coach--link" : ""}`}
          onClick={() => {
            if (coachHasId) router.push(`/main/coach/${side.coach.id}`)
          }}
        >
          Coach: {side.coach.name || "Unknown"}
        </div>
      )}
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
  if (!lineups) return <div className="matchEmpty">{data?.message || "Lineups not available"}</div>

  const rawHomeSide = lineups.find((s) => s.team.id === match.teams.home.id)
  const rawAwaySide = lineups.find((s) => s.team.id === match.teams.away.id)

  const homeSide = { ...rawHomeSide, startXI: attachSubEvents(rawHomeSide.startXI, events), substitutes: attachSubEvents(rawHomeSide.substitutes, events) }
  const awaySide = { ...rawAwaySide, startXI: attachSubEvents(rawAwaySide.startXI, events), substitutes: attachSubEvents(rawAwaySide.substitutes, events) }

  const showRating = preferences?.showPlayerRatings ?? true
  const dataSaver = preferences?.dataSaver ?? false

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="matchLineups">
      <div className="matchLineups__pitchWrap">
        <div className="matchLineups__teamLabel matchLineups__teamLabel--away">
          {!dataSaver && <Image src={awaySide.team.logo} alt={awaySide.team.name} width={18} height={18} />}
          <span>{awaySide.team.name} · {awaySide.formation}</span>
        </div>
        <Pitch homeSide={homeSide} awaySide={awaySide} showRating={showRating} dataSaver={dataSaver} />
        <div className="matchLineups__teamLabel matchLineups__teamLabel--home">
          {!dataSaver && <Image src={homeSide.team.logo} alt={homeSide.team.name} width={18} height={18} />}
          <span>{homeSide.team.name} · {homeSide.formation}</span>
        </div>
      </div>

      <div className="matchLineups__subs">
        <TeamSubsList side={homeSide} showRating={showRating} dataSaver={dataSaver} />
        <TeamSubsList side={awaySide} showRating={showRating} dataSaver={dataSaver} />
      </div>
    </motion.div>
  )
}