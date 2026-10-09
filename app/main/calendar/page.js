"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { useUser } from "@/context/userContext"
import { getUserTimeZone } from "@/lib/matchTime"

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
      className="skeleton-pulse"
      style={{ width, height, borderRadius: radius, ...style }}
    />
  )
}

function CalendarSkeleton() {
  return (
    <div className="calendar-skeleton">
      <div className="calendar-skeleton__header">
        <SkeletonPulse width={140} height={20} radius={6} />
        <div className="calendar-skeleton__nav">
          <SkeletonPulse width={32} height={32} radius={10} />
          <SkeletonPulse width={32} height={32} radius={10} />
        </div>
      </div>
      <div className="calendar-skeleton__weekdays">
        {Array.from({ length: 7 }).map((_, i) => (
          <SkeletonPulse key={i} width="100%" height={14} radius={4} style={{ opacity: 0.4 }} />
        ))}
      </div>
      <div className="calendar-skeleton__grid">
        {Array.from({ length: 35 }).map((_, i) => (
          <SkeletonPulse key={i} width="100%" height={64} radius={12} style={{ opacity: 0.25 + (i % 3) * 0.05 }} />
        ))}
      </div>
    </div>
  )
}

function MatchListSkeleton() {
  return (
    <div className="match-list-skeleton">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="match-list-skeleton__item"
          style={{ animationDelay: `${i * 0.1}s` }}
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
      className="empty-state"
    >
      <svg className="empty-state__icon" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="8" y1="3" x2="8" y2="7" />
        <line x1="16" y1="3" x2="16" y2="7" />
      </svg>
      <span className="empty-state__text">{message}</span>
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
  )

  const { data: dayData, isLoading: dayLoading } = useSWR(
    selectedDate
      ? `/api/matches?date=${selectedDate}&status=all&filter=favourites&tz=${encodeURIComponent(tz)}&page=1`
      : null,
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
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => router.push(`/main/matches/${match.id}`)}
        className="match-card"
      >
        <div className="match-card__header">
          {isLive ? (
            <span className="match-card__status match-card__status--live">
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="match-card__live-dot"
              />
              {match.elapsed || 0}' LIVE
            </span>
          ) : isFinished ? (
            <span className="match-card__status match-card__status--finished">FT</span>
          ) : (
            <span className="match-card__status match-card__status--upcoming">
              {new Date(match.timestamp * 1000).toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", timeZone: tz })}
            </span>
          )}
          <span className="match-card__league">{match.league.name}</span>
        </div>

        <div className="match-card__teams">
          <div className="match-card__team match-card__team--home">
            {!dataSaver && (
              <Image src={match.teams.home.logo} alt="" width={28} height={28} className="match-card__logo" />
            )}
            <span className="match-card__team-name">{match.teams.home.name}</span>
          </div>
          <span className={`match-card__score ${isLive || isFinished ? "match-card__score--active" : "match-card__score--upcoming"}`}>
            {isLive || isFinished ? `${match.goals.home ?? 0} - ${match.goals.away ?? 0}` : "vs"}
          </span>
          <div className="match-card__team match-card__team--away">
            <span className="match-card__team-name">{match.teams.away.name}</span>
            {!dataSaver && (
              <Image src={match.teams.away.logo} alt="" width={28} height={28} className="match-card__logo" />
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

    const cellClasses = [
      "calendar__cell",
      `calendar__cell--${cell.type}`,
      isSelected && "calendar__cell--selected",
      todayFlag && "calendar__cell--today",
    ].filter(Boolean).join(" ")

    return (
      <motion.div
        whileHover={cell.date ? { scale: 1.03 } : {}}
        whileTap={cell.date ? { scale: 0.97 } : {}}
        onClick={() => cell.date && setSelectedDate(cell.date)}
        className={cellClasses}
      >
        <span className="calendar__cell-day">{cell.day}</span>

        {hasData && (
          <div className="calendar__cell-dots">
            {Array.from({ length: Math.min(info.total, 8) }).map((_, i) => (
              <div
                key={i}
                className={`calendar__cell-dot ${
                  i < info.live
                    ? "calendar__cell-dot--live"
                    : i < info.live + info.finished
                    ? "calendar__cell-dot--finished"
                    : "calendar__cell-dot--upcoming"
                }`}
                style={{ opacity: i < info.live ? 1 : 0.7 }}
              />
            ))}
            {info.total > 8 && <span className="calendar__cell-more">+</span>}
          </div>
        )}

        {info?.hasLive && <div className="calendar__cell-live-indicator" />}
      </motion.div>
    )
  }

  /* ─── Week Row ─── */
  function WeekRow() {
    return (
      <div className="week-row">
        <div className="week-row__grid">
          {weekDays.map((date) => {
            const info = dayMap.get(date)
            const d = new Date(date + "T00:00:00")
            const isSelected = date === selectedDate
            const todayFlag = isToday(date)

            const btnClasses = [
              "week-row__day",
              isSelected && "week-row__day--selected",
              todayFlag && "week-row__day--today",
            ].filter(Boolean).join(" ")

            return (
              <motion.button
                key={date}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(date)}
                className={btnClasses}
              >
                <span className="week-row__day-name">
                  {WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                </span>
                <span className="week-row__day-number">{d.getDate()}</span>
                {info && info.total > 0 && (
                  <div className="week-row__day-dots">
                    {Array.from({ length: Math.min(info.total, 5) }).map((_, i) => (
                      <div
                        key={i}
                        className={`week-row__day-dot ${
                          i < info.live
                            ? "week-row__day-dot--live"
                            : i < info.live + info.finished
                            ? "week-row__day-dot--finished"
                            : "week-row__day-dot--upcoming"
                        }`}
                      />
                    ))}
                  </div>
                )}
                {info?.hasLive && <div className="week-row__day-live-indicator" />}
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
      <div className="day-panel">
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="day-panel__card"
        >
          <div className="day-panel__header">
            <div>
              <p className="day-panel__date-label">{formatDateLabel(selectedDate)}</p>
              <h3 className="day-panel__match-count">
                {total} Match{total !== 1 ? "es" : ""}
              </h3>
            </div>
            <div className="day-panel__icon-wrap">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="day-panel__badges">
            {live > 0 && <span className="day-panel__badge day-panel__badge--live">{live} Live</span>}
            {upcoming > 0 && <span className="day-panel__badge day-panel__badge--upcoming">{upcoming} Upcoming</span>}
            {selectedDayInfo?.finished > 0 && <span className="day-panel__badge day-panel__badge--finished">{selectedDayInfo.finished} Finished</span>}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          {dayLoading ? (
            <MatchListSkeleton key="skeleton" />
          ) : !hasDayMatches ? (
            <EmptyState key="empty" message="No favourite matches on this day" />
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="day-panel__list">
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
      <div className="calendar-page">
        {/* Top Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="calendar-page__top-bar"
        >
          <div className="calendar-page__title-block">
            <div className="calendar-page__icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <line x1="3" y1="10" x2="21" y2="10" />
                <line x1="8" y1="3" x2="8" y2="7" />
                <line x1="16" y1="3" x2="16" y2="7" />
              </svg>
            </div>
            <div>
              <h1 className="calendar-page__title">Match Calendar</h1>
              <p className="calendar-page__subtitle">
                {MONTH_NAMES[currentMonth.month - 1]} {currentMonth.year}
                {selectedDayInfo ? ` · ${selectedDayInfo.total} fixtures` : ""}
              </p>
            </div>
          </div>

          <div className="calendar-page__view-toggle">
            {["month", "week"].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`calendar-page__view-btn ${view === v ? "calendar-page__view-btn--active" : ""}`}
              >
                {v}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Main Grid */}
        <div className="calendar-page__main-grid">
          {/* LEFT: Calendar */}
          <motion.div
            className="calendar__container"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
          >
            {calendarLoading ? (
              <CalendarSkeleton />
            ) : (
              <>
                <div className="calendar__nav">
                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => (view === "month" ? shiftMonth(-1) : shiftWeek(-1))}
                    className="calendar__nav-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="15 18 9 12 15 6" /></svg>
                  </motion.button>

                  <h2 className="calendar__month-title">
                    {view === "month" ? `${MONTH_NAMES[currentMonth.month - 1]} ${currentMonth.year}` : `Week of ${formatDateLabel(weekDays[0])}`}
                  </h2>

                  <motion.button
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => (view === "month" ? shiftMonth(1) : shiftWeek(1))}
                    className="calendar__nav-btn"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><polyline points="9 18 15 12 9 6" /></svg>
                  </motion.button>
                </div>

                {view === "month" ? (
                  <>
                    <div className="calendar__weekdays">
                      {WEEKDAYS.map((w) => (
                        <div key={w} className="calendar__weekday">{w}</div>
                      ))}
                    </div>
                    <motion.div
                      className="calendar__grid"
                      initial="hidden"
                      animate="show"
                      variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.01 } } }}
                    >
                      {grid.map((cell, i) => (
                        <motion.div
                          key={`${cell.type}-${cell.day}-${i}`}
                          variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
                          className="calendar__cell-wrapper"
                        >
                          <DayCell cell={cell} />
                        </motion.div>
                      ))}
                    </motion.div>
                  </>
                ) : (
                  <WeekRow />
                )}

                <div className="calendar-legend">
                  <div className="calendar-legend__item">
                    <div className="calendar-legend__dot calendar-legend__dot--upcoming" />
                    <span>Upcoming</span>
                  </div>
                  <div className="calendar-legend__item">
                    <div className="calendar-legend__dot calendar-legend__dot--finished" />
                    <span>Finished</span>
                  </div>
                  <div className="calendar-legend__item">
                    <div className="calendar-legend__dot calendar-legend__dot--live" />
                    <span>Live</span>
                  </div>
                  <div className="calendar-legend__item">
                    <div className="calendar-legend__dot calendar-legend__dot--live-today" />
                    <span>Live today</span>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* RIGHT: Selected Day Panel */}
          <div className="day-panel__wrapper"><DayPanel /></div>
        </div>
      </div>
    </div>
  )
}