import useSWR from "swr"
import Image from "next/image"
import { useFavorites } from "@/context/favoriteContext"
import { toggleFavourite } from "@/services/favourites"
import { useState } from "react"

const DATES_PER_PAGE = 3 // how many date groups to show at a time

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

let flushTimer = null
const favQueue = new Map()

const scheduleFlush = () => {
  if (flushTimer) return
  flushTimer = setTimeout(async () => {
    const items = [...favQueue.values()]
    favQueue.clear()
    flushTimer = null
    for (const item of items) {
      try {
        await toggleFavourite({
          itemId: item.itemId,
          type: item.type,
          name: item.name,
          logo: item.logo,
        })
      } catch (err) {
        console.log("failed toggle", item)
      }
    }
  }, 800)
}

function groupByDate(matches) {
  const groups = {}
  const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone

  for (const match of matches) {
    const date = new Date(match.fixture.date)
    const label = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: userTz, // group by local date, not UTC date
    })

    if (!groups[label]) groups[label] = []
    groups[label].push(match)
  }

  return groups
}

function Results({ season, league, active }) {
  const { favorites, setFavorites } = useFavorites()
  const [visibleDates, setVisibleDates] = useState(DATES_PER_PAGE)

  const handleFav = (match) => {
    const key = match.fixture.id

    const exists = favorites?.match?.some((fav) => fav.itemId === key)

    setFavorites((prev) => {
      const list = prev.match || []
      const updated = exists
        ? list.filter((f) => f.itemId !== key)
        : [
          ...list,
          {
            itemId: key,
            name: `${match.teams.home.name} vs ${match.teams.away.name}`,
            logo: match.teams.home.logo,
            type: "MATCH",
          },
        ]
      return { ...prev, match: updated }
    })

    favQueue.set(key, {
      itemId: key,
      type: "MATCH",
      name: `${match.teams.home.name} vs ${match.teams.away.name}`,
      logo: match.teams.home.logo,
      action: exists ? "REMOVE" : "ADD",
    })

    scheduleFlush()
  }

  const { data, isLoading } = useSWR(
    active === "Results" && league
      ? `/api/fixtures?league=${league.league.id}&season=${season}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  if (isLoading) {
    return (
      <div className="resultsContainer">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="matchSkeleton" />
        ))}
      </div>
    )
  }

  const results = data?.data?.results || []
  const grouped = groupByDate(results)
  const allDates = Object.keys(grouped)
  const visibleGroups = allDates.slice(0, visibleDates)
  const hasMore = visibleDates < allDates.length

  return (
    <div className="resultsContainer">
      {visibleGroups.map((dateLabel) => (
        <div key={dateLabel}>
          <div className="dateSeparator">
            <span>{dateLabel}</span>
          </div>

          {grouped[dateLabel].map((match) => {
            const isFav = favorites?.match?.some(
              (f) => f.itemId === match.fixture.id
            )

            return (
              <div className="eachMatch" key={match.fixture.id}>
                <div className="timestamp">
                  <span>
                    {new Date(match.fixture.date).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone // user's local tz
                    })}
                  </span>
                  <span>{match.fixture.status.short}</span>
                </div>

                <div className="teams">
                  <div className="home">
                    <Image
                      src={match.teams.home.logo}
                      alt={match.teams.home.name}
                      width={24}
                      height={24}
                    />
                    <span>{match.teams.home.name}</span>
                  </div>

                  <div className="scoreline">
                    <span>
                      {match.goals.home} - {match.goals.away}
                    </span>
                    <span>{match.fixture.status.short}</span>
                  </div>

                  <div className="away">
                    <Image
                      src={match.teams.away.logo}
                      alt={match.teams.away.name}
                      width={24}
                      height={24}
                    />
                    <span>{match.teams.away.name}</span>
                  </div>
                </div>

                <div className="favorite">
                  <div
                    className="favourite-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleFav(match)
                    }}
                  >
                    <svg
                      style={{ strokeWidth: 1, height: 22, width: 22, stroke: "#fff" }}
                      viewBox="0 0 24 24"
                      className={`favourite-svg ${isFav ? "filled" : ""}`}
                    >
                      <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
                    </svg>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ))}

      {/* Load more dates */}
      {hasMore && (
        <button
          className="load-more-btn"
          onClick={() => setVisibleDates((v) => v + DATES_PER_PAGE)}
        >
          Show more ({allDates.length - visibleDates} more days)
        </button>
      )}
    </div>
  )
}

export default Results