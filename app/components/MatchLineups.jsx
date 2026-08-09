"use client"

import useSWR from "swr"
import Image from "next/image"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { useUser } from "@/context/userContext"

const fetcher = (url) => fetch(url).then((res) => res.json())

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
  if (rating >= 7.0) return "#1a7a3c"
  if (rating >= 6.0) return "#f09a0e"
  if (rating < 6.0) return "#5c6472"
  return "#7a1a3a"
}

function PlayerDot({ player, x, y, labelBelow, showRating, dataSaver }) {
  const clipId = `clip-${player.id}`
  const badgeY = labelBelow ? -4.5 : 4.5

  return (
    <g transform={`translate(${x}, ${y})`}>
      <defs>
        <clipPath id={clipId}>
          <circle r="3.2" />
        </clipPath>
      </defs>
      <circle r="3.4" fill="#1b2b3e" />
      {!dataSaver && (
        <image
          href={player.photo}
          x="-3.2"
          y="-3.2"
          width="6.4"
          height="6.4"
          clipPath={`url(#${clipId})`}
          preserveAspectRatio="xMidYMid slice"
        />
      )}
      <circle r="3.4" fill="none" strokeWidth="0.5" />

      {(player.subOffMinute || player.subOnMinute) && (
        <g transform="translate(2.6, 2.6)">
          <circle r="1.3" fill={player.subOnMinute ? "#1a7a3c" : "#d41b27"} />
          {player.subOnMinute ? (
            <ArrowLeft x={-1} y={-1} width={2} height={2} color="#fff" strokeWidth={3} />
          ) : (
            <ArrowRight x={-1} y={-1} width={2} height={2} color="#fff" strokeWidth={3} />
          )}
        </g>
      )}

      <text textAnchor="middle" y={labelBelow ? 6 : -5} fontSize="2.4" fill="#d1d5db">
        {player.number}. {player.name?.split(" ").slice(-1)[0]}
      </text>

      {showRating && player.rating !== null && (
        <g transform="translate(-5.4, -4.7)">
          <rect width="4.2" height="2.6" rx="0.4" fill={ratingColor(player.rating)} />
          <text x="1.9" y="1.9" textAnchor="middle" fontSize="1.9" fill="#fff" fontWeight="700">
            {player.rating?.toFixed(1)}
          </text>
        </g>
      )}

      <g transform={`translate(0, ${badgeY})`}>
        {Array.from({ length: player.goals || 0 }).map((_, i) => (
          <text key={`g${i}`} x={-3 + i * 2.2} fontSize="2.2" textAnchor="middle">⚽</text>
        ))}
        {player.yellowCards > 0 && (
          <rect x={-3 + (player.goals || 0) * 2.2} y="-1.6" width="1.4" height="2" fill="#f5c518" rx="0.2" />
        )}
        {player.redCards > 0 && (
          <rect x={-3 + (player.goals || 0) * 2.2 + 1.8} y="-1.6" width="1.4" height="2" fill="#d41b27" rx="0.2" />
        )}
      </g>
    </g>
  )
}

function Pitch({ homeSide, awaySide, showRating, dataSaver }) {
  const homePositions = computePositions(homeSide.startXI)
  const awayPositions = computePositions(awaySide.startXI)

  return (
    <svg viewBox="0 0 100 160" className="matchLineups__pitchSvg">
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
  return (
    <div className="matchLineups__team">
      <div className="matchLineups__teamHeader">
        <Image src={side.team.logo} alt={side.team.name} width={24} height={24} />
        <span>{side.team.name}</span>
        <span className="matchLineups__formation">{side.formation}</span>
      </div>
      <div className="matchLineups__section">
        <h4>Substitutes</h4>
        {side.substitutes.map((p) => (
          <div key={p.id} className="matchLineups__player">
            {!dataSaver && (
              <Image
                src={p.photo}
                alt=""
                width={24}
                height={24}
                className="matchLineups__playerPhoto"
                onError={(e) => { e.currentTarget.style.visibility = "hidden" }}
              />
            )}
            <span className="matchLineups__number">{p.number}</span>
            <span>{p.name}</span>
            <span className="matchLineups__position">{p.position}</span>
            {p.subOnMinute && <span className="matchLineups__subBadge on"><ArrowLeft size={19} />{p.subOnMinute}&apos;</span>}
            {showRating && p.rating !== null && (
              <span className="matchLineups__ratingBadge" style={{ backgroundColor: ratingColor(p.rating) }}>
                {p.rating?.toFixed(1)}
              </span>
            )}
          </div>
        ))}
      </div>
      {side.coach && <div className="matchLineups__coach">Coach: {side.coach}</div>}
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

  if (isLoading) return <div className="matchLineups__empty">Loading lineups...</div>
  if (!lineups) return <div className="matchLineups__empty">{data?.message || "Lineups not available"}</div>

  const rawHomeSide = lineups.find((s) => s.team.id === match.teams.home.id)
  const rawAwaySide = lineups.find((s) => s.team.id === match.teams.away.id)

  const homeSide = {
    ...rawHomeSide,
    startXI: attachSubEvents(rawHomeSide.startXI, events),
    substitutes: attachSubEvents(rawHomeSide.substitutes, events),
  }
  const awaySide = {
    ...rawAwaySide,
    startXI: attachSubEvents(rawAwaySide.startXI, events),
    substitutes: attachSubEvents(rawAwaySide.substitutes, events),
  }

  const showRating = preferences?.showPlayerRatings ?? true
  const dataSaver = preferences?.dataSaver ?? false

  return (
    <div className="matchLineups">
      <div className="matchLineups__pitchWrapper">
        <div className="matchLineups__pitchTeamLabel away">
          <Image src={awaySide.team.logo} alt={awaySide.team.name} width={18} height={18} />
          <span>{awaySide.team.name} · {awaySide.formation}</span>
        </div>
        <Pitch homeSide={homeSide} awaySide={awaySide} showRating={showRating} dataSaver={dataSaver} />
        <div className="matchLineups__pitchTeamLabel home">
          <Image src={homeSide.team.logo} alt={homeSide.team.name} width={18} height={18} />
          <span>{homeSide.team.name} · {homeSide.formation}</span>
        </div>
      </div>

      <div className="matchLineups__subsRow">
        <TeamSubsList side={homeSide} showRating={showRating} dataSaver={dataSaver} />
        <TeamSubsList side={awaySide} showRating={showRating} dataSaver={dataSaver} />
      </div>
    </div>
  )
}