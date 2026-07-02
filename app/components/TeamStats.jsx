// app/main/team/[teamId]/TeamStats.jsx
import useSWR from "swr"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

export default function TeamStats({ teamId, team, active }) {
  // We need a league ID to fetch stats — pull from the team's venue/info
  // API-Sports requires both team + league + season for statistics
  // We'll use the first league the team plays in from their info
  const leagueId = team?.league?.id

  const { data, isLoading } = useSWR(
    active === "Stats" && leagueId
      ? `/api/teams/${teamId}/stats?league=${leagueId}&season=${new Date().getFullYear()}`
      : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnFocus: false }
  )

  if (!leagueId) {
    return (
      <div className="teamStats">
        <div className="teamStats__empty">
          No league data available for stats
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="teamStats">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="teamStats__skeleton" />
        ))}
      </div>
    )
  }

  const stats = data?.data

  if (!stats) {
    return (
      <div className="teamStats">
        <div className="teamStats__empty">No stats available</div>
      </div>
    )
  }

  const { fixtures, goals, clean_sheet, failed_to_score, lineups } = stats

  // Most used formation
  const topFormation = lineups
    ?.sort((a, b) => b.played - a.played)[0]?.formation ?? "—"

  const statRows = [
    {
      label: "Matches played",
      value: fixtures?.played?.total ?? 0,
    },
    {
      label: "Wins",
      value: fixtures?.wins?.total ?? 0,
      sub: `Home ${fixtures?.wins?.home ?? 0} · Away ${fixtures?.wins?.away ?? 0}`,
      color: "#4caf50",
    },
    {
      label: "Draws",
      value: fixtures?.draws?.total ?? 0,
      sub: `Home ${fixtures?.draws?.home ?? 0} · Away ${fixtures?.draws?.away ?? 0}`,
      color: "#f5a623",
    },
    {
      label: "Losses",
      value: fixtures?.loses?.total ?? 0,
      sub: `Home ${fixtures?.loses?.home ?? 0} · Away ${fixtures?.loses?.away ?? 0}`,
      color: "#e53935",
    },
    {
      label: "Goals scored",
      value: goals?.for?.total?.total ?? 0,
      sub: `Home ${goals?.for?.total?.home ?? 0} · Away ${goals?.for?.total?.away ?? 0}`,
    },
    {
      label: "Goals conceded",
      value: goals?.against?.total?.total ?? 0,
      sub: `Home ${goals?.against?.total?.home ?? 0} · Away ${goals?.against?.total?.away ?? 0}`,
    },
    {
      label: "Clean sheets",
      value: clean_sheet?.total ?? 0,
      sub: `Home ${clean_sheet?.home ?? 0} · Away ${clean_sheet?.away ?? 0}`,
    },
    {
      label: "Failed to score",
      value: failed_to_score?.total ?? 0,
      sub: `Home ${failed_to_score?.home ?? 0} · Away ${failed_to_score?.away ?? 0}`,
    },
    {
      label: "Avg goals scored",
      value: goals?.for?.average?.total ?? "—",
      sub: "Per match",
    },
    {
      label: "Avg goals conceded",
      value: goals?.against?.average?.total ?? "—",
      sub: "Per match",
    },
    {
      label: "Favourite formation",
      value: topFormation,
      sub: `Used ${lineups?.[0]?.played ?? 0} times`,
    },
  ]

  const played = fixtures?.played?.total ?? 1
  const wins = fixtures?.wins?.total ?? 0
  const draws = fixtures?.draws?.total ?? 0
  const losses = fixtures?.loses?.total ?? 0

  const winPct = Math.round((wins / played) * 100)
  const drawPct = Math.round((draws / played) * 100)
  const lossPct = Math.round((losses / played) * 100)

  return (
    <div className="teamStats">

      {/* League + season context */}
      <div className="teamStats__context">
        <span className="teamStats__contextLabel">
          {stats.league?.name} · {stats.league?.season}
        </span>
      </div>

      {/* Win/Draw/Loss visual bar */}
      <div className="teamStats__formBar">
        <div
          className="teamStats__formBarSegment teamStats__formBarSegment--win"
          style={{ width: `${winPct}%` }}
          title={`Wins ${winPct}%`}
        />
        <div
          className="teamStats__formBarSegment teamStats__formBarSegment--draw"
          style={{ width: `${drawPct}%` }}
          title={`Draws ${drawPct}%`}
        />
        <div
          className="teamStats__formBarSegment teamStats__formBarSegment--loss"
          style={{ width: `${lossPct}%` }}
          title={`Losses ${lossPct}%`}
        />
      </div>

      <div className="teamStats__formBarLegend">
        <span className="teamStats__legendItem teamStats__legendItem--win">
          W {winPct}%
        </span>
        <span className="teamStats__legendItem teamStats__legendItem--draw">
          D {drawPct}%
        </span>
        <span className="teamStats__legendItem teamStats__legendItem--loss">
          L {lossPct}%
        </span>
      </div>

      {/* Stat rows */}
      {statRows.map((row, i) => (
        <div key={i} className="teamStats__row">
          <div className="teamStats__rowLeft">
            <span className="teamStats__rowLabel">{row.label}</span>
            {row.sub && (
              <span className="teamStats__rowSub">{row.sub}</span>
            )}
          </div>
          <span
            className="teamStats__rowValue"
            style={{ color: row.color ?? "#fff" }}
          >
            {row.value}
          </span>
        </div>
      ))}

    </div>
  )
}