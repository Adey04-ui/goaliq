"use client"

import useSWR from "swr"
import Image from "next/image"
import { motion } from "framer-motion"
import { useUser } from "@/context/userContext"
import { GoalIcon, OwnGoalIcon, MissedPenaltyIcon, SubstitutionIcon, YellowCardIcon, RedCardIcon } from "./EventIcons"

const fetcher = (url) => fetch(url).then((res) => res.json())

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.98 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", damping: 22, stiffness: 300 } },
}

function SkeletonPulse({ width, height, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
        backgroundSize: "200% 100%",
        animation: "overviewShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function OverviewSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes overviewShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>

      {/* Timeline skeleton */}
      <div style={{ background: "rgba(12,17,23,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70,82,97,0.12)", borderRadius: 16, padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <SkeletonPulse width={120} height={16} radius={6} style={{ marginBottom: 4 }} />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: "1px solid rgba(70,82,97,0.08)" }}>
            <SkeletonPulse width={32} height={12} radius={4} style={{ opacity: 0.5 }} />
            <SkeletonPulse width={16} height={16} radius="50%" style={{ opacity: 0.4 }} />
            <SkeletonPulse width={`${50 + (i % 3) * 15}%`} height={14} radius={6} />
          </div>
        ))}
      </div>

      {/* Stats highlight skeleton */}
      <div style={{ background: "rgba(12,17,23,0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70,82,97,0.12)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <SkeletonPulse width={40} height={14} radius={6} style={{ opacity: 0.5 }} />
              <SkeletonPulse width={80} height={12} radius={6} style={{ opacity: 0.35 }} />
              <SkeletonPulse width={40} height={14} radius={6} style={{ opacity: 0.5 }} />
            </div>
            <SkeletonPulse width="100%" height={8} radius={4} style={{ opacity: 0.25 }} />
          </div>
        ))}
      </div>
    </div>
  )
}

function EventIcon({ type, detail }) {
  if (type === "Goal" && detail === "Own Goal") return <OwnGoalIcon size={16} />
  if (type === "Goal" && detail === "Missed Penalty") return <MissedPenaltyIcon size={16} />
  if (type === "Goal") return <GoalIcon size={16} />
  if (type === "Card" && detail === "Yellow Card") return <YellowCardIcon size={16} />
  if (type === "Card" && detail === "Second Yellow card") return <YellowCardIcon size={16} />
  if (type === "Card" && detail === "Red Card") return <RedCardIcon size={16} />
  if (type === "subst") return <SubstitutionIcon size={16} />
  return <span style={{ color: "#8896a8" }}>•</span>
}

function LiveOrFinishedOverview({ match, matchId, isActive }) {
  const { preferences } = useUser()
  const dataSaver = preferences?.dataSaver ?? false

  const { data: eventsData, isLoading: eventsLoading } = useSWR(
    isActive ? `/api/matches/${matchId}/events?status=${match.status}` : null,
    fetcher,
    { refreshInterval: match.status === "LIVE" ? 30000 : 0 }
  )
  const { data: statsData, isLoading: statsLoading } = useSWR(
    isActive ? `/api/matches/${matchId}/stats?status=${match.status}` : null,
    fetcher
  )

  const events = eventsData?.data || []
  const stats = statsData?.data

  if (eventsLoading || statsLoading) return <OverviewSkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Timeline */}
      <motion.div variants={itemVariants} style={{ background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "20px 24px", display: "flex", flexDirection: "column", gap: 2 }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10 }}>Match Events</h3>
        {events.length === 0 ? (
          <div style={{ textAlign: "center", padding: "32px 0", color: "#556677", fontSize: 13 }}>No events recorded yet</div>
        ) : (
          events.map((e, i) => {
            const isHome = e.team?.id === match.teams.home.id
            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 0",
                  borderBottom: i < events.length - 1 ? "1px solid rgba(70, 82, 97, 0.08)" : "none",
                  flexDirection: isHome ? "row" : "row-reverse",
                  textAlign: isHome ? "left" : "right",
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: "#556677", minWidth: 36, fontVariantNumeric: "tabular-nums" }}>
                  {e.time}{e.extraTime ? `+${e.extraTime}` : ""}&apos;
                </span>
                <div style={{ color: "#cfcfcf", fontSize: 13, display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: isHome ? "flex-start" : "flex-end" }}>
                  {e.type !== "subst" && <EventIcon type={e.type} detail={e.detail} />}
                  <span style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap", justifyContent: isHome ? "flex-start" : "flex-end" }}>
                    {e.player}
                    {e.type === "subst" && e.assist && (
                      <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#8896a8" }}>
                        <EventIcon type={e.type} detail={e.detail} /> {e.assist}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </motion.div>

      {/* Stats Highlight */}
      {stats && (
        <motion.div variants={itemVariants} style={{ background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 20 }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 1 }}>Key Stats</h3>
          {[
            { label: "Possession", home: stats.home.stats["Ball Possession"], away: stats.away.stats["Ball Possession"] },
            { label: "Total Shots", home: stats.home.stats["Total Shots"], away: stats.away.stats["Total Shots"] },
            { label: "On Target", home: stats.home.stats["Shots on Goal"], away: stats.away.stats["Shots on Goal"] },
          ].map((stat) => {
            const homeNum = parseInt(stat.home) || 0
            const awayNum = parseInt(stat.away) || 0
            const total = homeNum + awayNum || 1
            const homePct = (homeNum / total) * 100
            return (
              <div key={stat.label} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, fontWeight: 600 }}>
                  <span style={{ color: "#fff", minWidth: 40, textAlign: "left" }}>{stat.home ?? "-"}</span>
                  <span style={{ color: "#8896a8", fontSize: 12, fontWeight: 500, textTransform: "capitalize" }}>{stat.label}</span>
                  <span style={{ color: "#fff", minWidth: 40, textAlign: "right" }}>{stat.away ?? "-"}</span>
                </div>
                <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", background: "rgba(255,255,255,0.06)" }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${homePct}%` }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ background: "#3b82f6", height: "100%" }} />
                  <motion.div initial={{ width: 0 }} animate={{ width: `${100 - homePct}%` }} transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }} style={{ background: "#ef4444", height: "100%" }} />
                </div>
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}

function FormBadges({ form }) {
  if (!form?.length) return null
  return (
    <div style={{ display: "flex", gap: 6 }}>
      {form.map((f, i) => (
        <span
          key={i}
          title={`${f.opponent} ${f.score}`}
          style={{
            width: 26,
            height: 26,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 11,
            fontWeight: 700,
            color: "#fff",
            background: f.result === "W" ? "#22c55e" : f.result === "D" ? "#f5a623" : "#ef4444",
          }}
        >
          {f.result}
        </span>
      ))}
    </div>
  )
}

function UpcomingOverview({ match, matchId, isActive }) {
  const { preferences } = useUser()
  const dataSaver = preferences?.dataSaver ?? false

  const { data: h2hData, isLoading: h2hLoading } = useSWR(
    isActive ? `/api/matches/${matchId}/h2h?home=${match.teams.home.id}&away=${match.teams.away.id}` : null,
    fetcher
  )
  const { data: formData, isLoading: formLoading } = useSWR(
    isActive ? `/api/matches/${matchId}/form?home=${match.teams.home.id}&away=${match.teams.away.id}` : null,
    fetcher
  )
  const { data: oddsData, isLoading: oddsLoading } = useSWR(isActive ? `/api/matches/${matchId}/odds` : null, fetcher)

  const h2h = h2hData?.data
  const form = formData?.data
  const odds = oddsData?.data

  if (h2hLoading || formLoading || oddsLoading) return <OverviewSkeleton />

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Form */}
      <motion.div variants={itemVariants} style={{ background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "20px 24px" }}>
        <h3 style={{ fontSize: 12, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Recent Form</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!dataSaver && <Image src={match.teams.home.logo} alt={match.teams.home.name} width={22} height={22} style={{ objectFit: "contain" }} />}
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flex: 1 }}>{match.teams.home.name}</span>
            <FormBadges form={form?.home} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {!dataSaver && <Image src={match.teams.away.logo} alt={match.teams.away.name} width={22} height={22} style={{ objectFit: "contain" }} />}
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", flex: 1 }}>{match.teams.away.name}</span>
            <FormBadges form={form?.away} />
          </div>
        </div>
      </motion.div>

      {/* H2H */}
      {h2h && (
        <motion.div variants={itemVariants} style={{ background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "20px 24px" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Head-to-Head</h3>
          <div style={{ display: "flex", justifyContent: "space-around", padding: "12px 0", borderBottom: "1px solid rgba(70, 82, 97, 0.12)", marginBottom: 12, fontWeight: 700, fontSize: 14 }}>
            <span style={{ color: "#3b82f6" }}>{h2h.record.homeWins}W</span>
            <span style={{ color: "#8896a8" }}>{h2h.record.draws}D</span>
            <span style={{ color: "#ef4444" }}>{h2h.record.awayWins}W</span>
          </div>
          {h2h.meetings.slice(0, 3).map((m) => (
            <div key={m.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", fontSize: 13, color: "#d1d5db" }}>
              <span style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                {!dataSaver && <Image src={m.teams.home.logo} alt="" width={16} height={16} style={{ objectFit: "contain" }} />}
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.teams.home.name}</span>
                <span style={{ fontWeight: 700, color: "#fff", margin: "0 4px" }}>{m.goals.home}-{m.goals.away}</span>
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.teams.away.name}</span>
                {!dataSaver && <Image src={m.teams.away.logo} alt="" width={16} height={16} style={{ objectFit: "contain" }} />}
              </span>
              <span style={{ color: "#556677", fontSize: 11, flexShrink: 0 }}>{new Date(m.date).toLocaleDateString()}</span>
            </div>
          ))}
        </motion.div>
      )}

      {/* Odds */}
      {(odds?.prediction || odds?.odds) && (
        <motion.div variants={itemVariants} style={{ background: "rgba(12, 17, 23, 0.5)", backdropFilter: "blur(8px)", border: "1px solid rgba(70, 82, 97, 0.12)", borderRadius: 16, padding: "20px 24px" }}>
          <h3 style={{ fontSize: 12, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Prediction & Odds</h3>
          {odds.prediction && (
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {[
                { label: "Home Win", pct: odds.prediction.homeWinPercent, color: "#3b82f6" },
                { label: "Draw", pct: odds.prediction.drawPercent, color: "#8896a8" },
                { label: "Away Win", pct: odds.prediction.awayWinPercent, color: "#ef4444" },
              ].map((p) => (
                <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#8896a8", width: 70 }}>{p.label}</span>
                  <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: p.pct }} transition={{ duration: 0.8, ease: "easeOut" }} style={{ height: "100%", background: p.color, borderRadius: 3 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#fff", minWidth: 36, textAlign: "right" }}>{p.pct}</span>
                </div>
              ))}
            </div>
          )}
          {odds.odds && (
            <div style={{ display: "flex", justifyContent: "space-around", paddingTop: 12, borderTop: "1px solid rgba(70, 82, 97, 0.12)" }}>
              {odds.odds.values.map((v) => (
                <div key={v.value} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 11, color: "#8896a8" }}>{v.value}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{v.odd}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

export default function MatchOverview({ match, active, matchId }) {
  const isActive = active === "Overview"
  if (match.status === "UPCOMING") {
    return <UpcomingOverview match={match} matchId={matchId} isActive={isActive} />
  }
  return <LiveOrFinishedOverview match={match} matchId={matchId} isActive={isActive} />
}