"use client"

import useSWR from "swr"
import { motion } from "framer-motion"
import { shadeColor } from "@/lib/color"

const fetcher = (url) => fetch(url).then((res) => res.json())

const STAT_ORDER = [
  "Ball Possession",
  "Total Shots",
  "Shots on Goal",
  "Shots off Goal",
  "Corner Kicks",
  "Fouls",
  "Offsides",
  "Yellow Cards",
  "Red Cards",
  "Total passes",
  "Passes accurate",
]

function SkeletonPulse({ width, height, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
        backgroundSize: "200% 100%",
        animation: "statsShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function StatsSkeleton() {
  return (
    <div className="matchStats">
      <style>{`@keyframes statsShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <SkeletonPulse width={30} height={13} radius={6} style={{ opacity: 0.5 }} />
            <SkeletonPulse width={90} height={12} radius={6} style={{ opacity: 0.35 }} />
            <SkeletonPulse width={30} height={13} radius={6} style={{ opacity: 0.5 }} />
          </div>
          <SkeletonPulse width="100%" height={8} radius={4} style={{ opacity: 0.25 }} />
        </div>
      ))}
    </div>
  )
}

function parseValue(v) {
  if (v === null || v === undefined) return 0
  if (typeof v === "string" && v.includes("%")) return parseFloat(v)
  return Number(v) || 0
}

function StatBar({ label, homeValue, awayValue, homeColor, awayColor, index }) {
  const homeNum = parseValue(homeValue)
  const awayNum = parseValue(awayValue)
  const total = homeNum + awayNum || 1
  const homePct = (homeNum / total) * 100

  // Team colors are extracted per-match data, not theme colors, so these gradients stay inline.
  const homeGradient = `linear-gradient(to bottom, ${shadeColor(homeColor, 25)} 0%, ${homeColor} 50%, ${shadeColor(homeColor, -25)} 100%)`
  const awayGradient = `linear-gradient(to bottom, ${shadeColor(awayColor, 25)} 0%, ${awayColor} 50%, ${shadeColor(awayColor, -25)} 100%)`

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      className="matchStats__card"
    >
      <div className="matchStats__header">
        <span className="matchStats__value matchStats__value--home">{homeValue ?? 0}</span>
        <span className="matchStats__label">{label}</span>
        <span className="matchStats__value matchStats__value--away">{awayValue ?? 0}</span>
      </div>
      <div className="matchStats__track">
        <motion.div initial={{ width: 0 }} animate={{ width: `${homePct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="matchStats__fill" style={{ background: homeGradient }} />
        <motion.div initial={{ width: 0 }} animate={{ width: `${100 - homePct}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} className="matchStats__fill" style={{ background: awayGradient }} />
      </div>
    </motion.div>
  )
}

export default function MatchStats({ match, matchId, active }) {
  const { data, isLoading } = useSWR(active === "Stats" ? `/api/matches/${matchId}/stats?status=${match.status}` : null, fetcher, {
    refreshInterval: match.status === "LIVE" ? 30000 : 0,
  })
  const { data: homeColorData } = useSWR(`/api/teams/${match.teams.home.id}/color`, fetcher)
  const { data: awayColorData } = useSWR(`/api/teams/${match.teams.away.id}/color`, fetcher)

  const stats = data?.data
  const homeColor = homeColorData?.data?.color || "#d41b27"
  const awayColor = awayColorData?.data?.color || "#465261"

  if (isLoading) return <StatsSkeleton />

  if (!stats) {
    return <div className="matchEmpty">{data?.message || "Stats not available yet"}</div>
  }

  return (
    <div className="matchStats">
      {STAT_ORDER.filter((key) => stats.home.stats[key] !== undefined || stats.away.stats[key] !== undefined).map((key, i) => (
        <StatBar
          key={key}
          label={key}
          homeValue={stats.home.stats[key]}
          awayValue={stats.away.stats[key]}
          homeColor={homeColor}
          awayColor={awayColor}
          index={i}
        />
      ))}
    </div>
  )
}
