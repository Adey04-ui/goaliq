"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useUser } from "@/context/userContext"
import { getUserTimeZone } from "@/lib/matchTime"

const fetcher = (url) => fetch(url).then((res) => res.json())

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
]

/* ─── Helpers ─── */
function formatDateLabel(dateStr) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" })
}

function getMonthGrid(year, month) {
  const firstDayOfMonth = new Date(year, month - 1, 1).getDay()
  const mondayStart = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1
  const daysInMonth = new Date(year, month, 0).getDate()
  const prevMonthDays = new Date(year, month - 1, 0).getDate()

  const grid = []
  for (let i = mondayStart - 1; i >= 0; i--) {
    grid.push({ type: "prev", day: prevMonthDays - i, date: null })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    grid.push({
      type: "current",
      day: d,
      date: `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    })
  }
  const remaining = (7 - (grid.length % 7)) % 7
  for (let d = 1; d <= remaining; d++) {
    grid.push({ type: "next", day: d, date: null })
  }
  return grid
}

function getWeekRange(dateStr) {
  const d = new Date(dateStr + "T00:00:00")
  const day = d.getDay()
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(d)
  monday.setDate(d.getDate() + mondayOffset)
  const days = []
  for (let i = 0; i < 7; i++) {
    const cd = new Date(monday)
    cd.setDate(monday.getDate() + i)
    days.push(cd.toISOString().slice(0, 10))
  }
  return days
}

/* ─── Skeletons ─── */
function SkeletonPulse({ width, height, radius = 8, style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
        backgroundSize: "200% 100%",
        animation: "calendarShimmer 1.4s ease-in-out infinite",
        ...style,
      }}
    />
  )
}

function CalendarSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <style>{`@keyframes calendarShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <SkeletonPulse width={140} height={20} radius={6} />
        <div style={{ display: "flex", gap: 8 }}>
          <SkeletonPulse width={32} height={32} radius={10} />
          <SkeletonPulse width={32} height={32} radius={10} />
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonPulse key={i} width="100%" height={14} radius={4} style={{ opacity: 0.4 }} />
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
        {Array.from({ length: 35 }).map((_, i) => (
          <SkeletonPulse key={i} width="100%" height={64} radius={12} style={{ opacity: 0.25 + (i % 3) * 0.05 }} />
        ))}
      </div>
    </div>
  )
}

function MatchListSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <style>{`@keyframes calendarShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 80,
            borderRadius: 14,
            background: "linear-gradient(90deg, #1a2a3a 25%, #243447 50%, #1a2a3a 75%)",
            backgroundSize: "200% 100%",
            animation: "calendarShimmer 1.4s infinite",
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  )
}

function EmptyState({ message }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        gap: 12,
        color: "#556677",
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" opacity={0.3}>
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </svg>
      <span style={{ fontSize: 14, fontWeight: 500 }}>{message}</span>
    </motion.div>
  )
}

/* ─── Main Page ─── */
export default function CalendarPage() {
  const router = useRouter()
  const { preferences } = useUser()
  const tz = preferences?.timeZone || getUserTimeZone()

  const today = new Date().toISOString().slice(0, 10)
  const [view, setView] = useState("month")
  const [currentMonth, setCurrentMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() + 1 }
  })
  const [selectedDate, setSelectedDate] = useState(today)

  useEffect(() => {
    const d = new Date(selectedDate + "T00:00:00")
    const m = d.getMonth() + 1
    const y = d.getFullYear()
    if (m !== currentMonth.month || y !== currentMonth.year) {
      setCurrentMonth({ year: y, month: m })
    }
  }, [selectedDate])

  const monthKey = `${currentMonth.year}-${String(currentMonth.month).padStart(2, "0")}`

  const { data: calendarData, isLoading: calendarLoading } = useSWR(
    `/api/matches/calendar?month=${monthKey}&tz=${encodeURIComponent(tz)}`,
    fetcher
  )

  const { data: dayData, isLoading: dayLoading } = useSWR(
    selectedDate
      ? `/api/matches?date=${selectedDate}&status=all&filter=favourites&tz=${encodeURIComponent(tz)}&page=1`
      : null,
    fetcher
  )

  const dayMap = useMemo(() => {
    if (!calendarData?.data?.days) return new Map()
    return new Map(calendarData.data.days.map((d) => [d.date, d]))
  }, [calendarData])

  const selectedDayInfo = dayMap.get(selectedDate)
  const dayMatches = dayData?.data?.leagues || []
  const hasDayMatches = dayMatches.length > 0

  const grid = useMemo(() => getMonthGrid(currentMonth.year, currentMonth.month), [currentMonth])
  const weekDays = useMemo(() => getWeekRange(selectedDate), [selectedDate])

  function shiftMonth(delta) {
    setCurrentMonth((prev) => {
      let m = prev.month + delta
      let y = prev.year
      if (m > 12) { m = 1; y++ }
      if (m < 1) { m = 12; y-- }
      return { year: y, month: m }
    })
  }

  function shiftWeek(delta) {
    const d = new Date(selectedDate + "T00:00:00")
    d.setDate(d.getDate() + delta * 7)
    setSelectedDate(d.toISOString().slice(0, 10))
  }

  function isToday(dateStr) {
    return dateStr === today
  }

  /* ─── Match Card ─── */
  function MatchCard({ match }) {
    const isLive = match.status === "LIVE"
    const isFinished = match.status === "FINISHED"
    const dataSaver = preferences?.dataSaver ?? false

    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.01, backgroundColor: "rgba(27, 43, 62, 0.6)" }}
        onClick={() => router.push(`/main/matches/${match.id}`)}
        style={{
          background: "rgba(12, 17, 23, 0.5)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(70, 82, 97, 0.12)",
          borderRadius: 16,
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          {isLive ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: 0.5, display: "flex", alignItems: "center", gap: 6 }}>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }}
              />
              {match.elapsed || 0}' LIVE
            </span>
          ) : isFinished ? (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#8896a8", textTransform: "uppercase", letterSpacing: 0.5 }}>FT</span>
          ) : (
            <span style={{ fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.5 }}>
              {new Date(match.timestamp * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: tz })}
            </span>
          )}
          <span style={{ fontSize: 11, color: "#556677" }}>{match.league.name}</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
            {!dataSaver && (
              <Image src={match.teams.home.logo} alt="" width={28} height={28} style={{ borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
            )}
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {match.teams.home.name}
            </span>
          </div>
          <span style={{ fontSize: isLive || isFinished ? 18 : 14, fontWeight: 800, color: isLive || isFinished ? "#fff" : "#556677", minWidth: 50, textAlign: "center" }}>
            {isLive || isFinished ? `${match.goals.home ?? 0} - ${match.goals.away ?? 0}` : "vs"}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0, justifyContent: "flex-end" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", textAlign: "right" }}>
              {match.teams.away.name}
            </span>
            {!dataSaver && (
              <Image src={match.teams.away.logo} alt="" width={28} height={28} style={{ borderRadius: 8, objectFit: "contain", flexShrink: 0 }} />
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  /* ─── Day Cell ─── */
  function DayCell({ cell }) {
    const info = cell.date ? dayMap.get(cell.date) : null
    const isSelected = cell.date === selectedDate
    const todayFlag = cell.date ? isToday(cell.date) : false
    const hasData = info && info.total > 0

    return (
      <motion.div
        whileHover={cell.date ? { scale: 1.03 } : {}}
        whileTap={cell.date ? { scale: 0.97 } : {}}
        onClick={() => cell.date && setSelectedDate(cell.date)}
        style={{
          aspectRatio: 1,
          borderRadius: 12,
          padding: 8,
          background: isSelected ? "rgba(59, 130, 246, 0.12)" : todayFlag ? "rgba(255, 255, 255, 0.04)" : cell.type === "current" ? "rgba(255, 255, 255, 0.02)" : "transparent",
          border: isSelected ? "1px solid rgba(59, 130, 246, 0.4)" : todayFlag ? "1px solid rgba(70, 82, 97, 0.2)" : "1px solid transparent",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          cursor: cell.date ? "pointer" : "default",
          opacity: cell.type === "current" ? 1 : 0.25,
          position: "relative",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: isSelected || todayFlag ? 700 : 600, color: isSelected ? "#3b82f6" : todayFlag ? "#fff" : "#8896a8" }}>
          {cell.day}
        </span>

        {hasData && (
          <div style={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            {Array.from({ length: Math.min(info.total, 8) }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background:
                    i < info.live
                      ? "#ef4444"
                      : i < info.live + info.finished
                      ? "#a855f7"
                      : "#3b82f6",
                  opacity: i < info.live ? 1 : 0.7,
                }}
              />
            ))}
            {info.total > 8 && <span style={{ fontSize: 8, color: "#556677", marginLeft: 2 }}>+</span>}
          </div>
        )}

        {info?.hasLive && (
          <div style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 6px rgba(34, 197, 94, 0.6)" }} />
        )}
      </motion.div>
    )
  }

  /* ─── Week Row ─── */
  function WeekRow() {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }}>
          {weekDays.map((date) => {
            const info = dayMap.get(date)
            const d = new Date(date + "T00:00:00")
            const isSelected = date === selectedDate
            const todayFlag = isToday(date)

            return (
              <motion.button
                key={date}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
                style={{
                  background: isSelected ? "rgba(59, 130, 246, 0.15)" : todayFlag ? "rgba(255, 255, 255, 0.05)" : "rgba(255, 255, 255, 0.02)",
                  border: isSelected ? "1px solid rgba(59, 130, 246, 0.4)" : "1px solid rgba(70, 82, 97, 0.1)",
                  borderRadius: 14,
                  padding: "12px 8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  cursor: "pointer",
                  color: isSelected ? "#3b82f6" : todayFlag ? "#fff" : "#8896a8",
                }}
              >
                <span style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase" }}>
                  {WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                </span>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{d.getDate()}</span>
                {info && info.total > 0 && (
                  <div style={{ display: "flex", gap: 2 }}>
                    {Array.from({ length: Math.min(info.total, 5) }).map((_, i) => (
                      <div
                        key={i}
                        style={{
                          width: 3,
                          height: 3,
                          borderRadius: "50%",
                          background:
                            i < info.live
                              ? "#ef4444"
                              : i < info.live + info.finished
                              ? "#a855f7"
                              : "#3b82f6",
                        }}
                      />
                    ))}
                  </div>
                )}
                {info?.hasLive && (
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px rgba(34, 197, 94, 0.5)" }} />
                )}
              </motion.button>
            )
          })}
        </div>
      </div>
    )
  }

  /* ─── Selected Day Panel ─── */
  function DayPanel() {
    const total = selectedDayInfo?.total || 0
    const live = selectedDayInfo?.live || 0
    const upcoming = selectedDayInfo?.upcoming || 0

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: "rgba(12, 17, 23, 0.7)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(70, 82, 97, 0.18)",
            borderRadius: 20,
            padding: 20,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <p style={{ margin: "0 0 4px", fontSize: 11, fontWeight: 700, color: "#3b82f6", textTransform: "uppercase", letterSpacing: 0.8 }}>
                {formatDateLabel(selectedDate)}
              </p>
              <h3 style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#fff" }}>
                {total} Match{total !== 1 ? "es" : ""}
              </h3>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: "rgba(59, 130, 246, 0.12)", border: "1px solid rgba(59, 130, 246, 0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {live > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", fontSize: 11, fontWeight: 700 }}>{live} Live</span>}
            {upcoming > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(59, 130, 246, 0.1)", color: "#3b82f6", fontSize: 11, fontWeight: 700 }}>{upcoming} Upcoming</span>}
            {selectedDayInfo?.finished > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(168, 85, 247, 0.1)", color: "#a855f7", fontSize: 11, fontWeight: 700 }}>{selectedDayInfo.finished} Finished</span>}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {dayLoading ? (
            <MatchListSkeleton key="skeleton" />
          ) : !hasDayMatches ? (
            <EmptyState key="empty" message="No favourite matches on this day" />
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {dayMatches.map((group) => group.matches.map((match) => <MatchCard key={match.id} match={match} />))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  /* ─── Render ─── */
  return (
    <div className="parent-container">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Top Bar */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(59, 130, 246, 0.15)", border: "1px solid rgba(59, 130, 246, 0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
              </svg>
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800, letterSpacing: -0.3, color: "#fff" }}>Match Calendar</h1>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: "#556677" }}>
                {MONTH_NAMES[currentMonth.month - 1]} {currentMonth.year}
                {selectedDayInfo ? ` · ${selectedDayInfo.total} fixtures` : ""}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            {["month", "week"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 10,
                  border: view === v ? "none" : "1px solid rgba(70, 82, 97, 0.3)",
                  background: view === v ? "#1b3a5c" : "rgba(27, 43, 62, 0.5)",
                  color: view === v ? "#fff" : "#8896a8",
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                  textTransform: "capitalize",
                  transition: "all 0.2s",
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>
          {/* LEFT: Calendar */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            style={{
              background: "rgba(12, 17, 23, 0.7)",
              backdropFilter: "blur(16px)",
              WebkitBackdropFilter: "blur(16px)",
              border: "1px solid rgba(70, 82, 97, 0.18)",
              borderRadius: 20,
              padding: 24,
              boxShadow: "0 20px 40px rgba(0,0,0,0.25)",
            }}
          >
            {calendarLoading ? (
              <CalendarSkeleton />
            ) : (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <motion.button
                    whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => (view === "month" ? shiftMonth(-1) : shiftWeek(-1))}
                    style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6" /></svg>
                  </motion.button>

                  <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff" }}>
                    {view === "month" ? `${MONTH_NAMES[currentMonth.month - 1]} ${currentMonth.year}` : `Week of ${formatDateLabel(weekDays[0])}`}
                  </h2>

                  <motion.button
                    whileHover={{ scale: 1.08, backgroundColor: "rgba(255,255,255,0.08)" }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => (view === "month" ? shiftMonth(1) : shiftWeek(1))}
                    style={{ width: 32, height: 32, borderRadius: 10, border: "none", background: "rgba(255,255,255,0.04)", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6" /></svg>
                  </motion.button>
                </div>

                {view === "month" ? (
                  <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8, marginBottom: 8 }}>
                      {WEEKDAYS.map((w) => (
                        <div key={w} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#556677", textTransform: "uppercase", letterSpacing: 0.5 }}>{w}</div>
                      ))}
                    </div>
                    <motion.div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 8 }} initial="hidden" animate="show" variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.01 } } }}>
                      {grid.map((cell, i) => (
                        <motion.div key={`${cell.type}-${cell.day}-${i}`} variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}>
                          <DayCell cell={cell} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                ) : (
                  <WeekRow />
                )}

                <div style={{ display: "flex", gap: 16, marginTop: 16, paddingTop: 16, borderTop: "1px solid rgba(70, 82, 97, 0.12)", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#3b82f6" }} /><span style={{ fontSize: 11, color: "#556677" }}>Upcoming</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#a855f7" }} /><span style={{ fontSize: 11, color: "#556677" }}>Finished</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ef4444" }} /><span style={{ fontSize: 11, color: "#556677" }}>Live</span></div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 6, height: 6, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 4px rgba(34,197,94,0.5)" }} /><span style={{ fontSize: 11, color: "#556677" }}>Live today</span></div>
                </div>
              </>
            )}
          </motion.div>

          {/* RIGHT: Selected Day Panel */}
          <div style={{ minWidth: 0 }}><DayPanel /></div>
        </div>
      </div>
    </div>
  )
}