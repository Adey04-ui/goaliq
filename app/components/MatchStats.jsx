import useSWR from "swr"
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

function parseValue(v) {
  if (v === null || v === undefined) return 0
  if (typeof v === "string" && v.includes("%")) return parseFloat(v)
  return Number(v) || 0
}

function StatBar({ label, homeValue, awayValue, homeColor, awayColor }) {
  const homeNum = parseValue(homeValue)
  const awayNum = parseValue(awayValue)
  const total = homeNum + awayNum || 1
  const homePct = (homeNum / total) * 100

  const homeGradient = `linear-gradient(to bottom, ${shadeColor(homeColor, 25)} 0%, ${homeColor} 50%, ${shadeColor(homeColor, -25)} 100%)`
  const awayGradient = `linear-gradient(to bottom, ${shadeColor(awayColor, 25)} 0%, ${awayColor} 50%, ${shadeColor(awayColor, -25)} 100%)`

  return (
    <div className="matchStats__row">
      <div className="matchStats__values">
        <span>{homeValue ?? 0}</span>
        <span className="matchStats__label">{label}</span>
        <span>{awayValue ?? 0}</span>
      </div>
      <div className="matchStats__bar">
        <div className="matchStats__barHome" style={{ width: `${homePct}%`, background: homeGradient }} />
        <div className="matchStats__barAway" style={{ width: `${100 - homePct}%`, background: awayGradient }} />
      </div>
    </div>
  )
}

export default function MatchStats({ match, matchId }) {
  const { data, isLoading } = useSWR(`/api/matches/${matchId}/stats?status=${match.status}`, fetcher, {
    refreshInterval: match.status === "LIVE" ? 30000 : 0,
  })
  const { data: homeColorData } = useSWR(`/api/teams/${match.teams.home.id}/color`, fetcher)
  const { data: awayColorData } = useSWR(`/api/teams/${match.teams.away.id}/color`, fetcher)

  const stats = data?.data
  const homeColor = homeColorData?.data?.color || "#d41b27"
  const awayColor = awayColorData?.data?.color || "#465261"

  if (isLoading) return <div className="matchStats__empty">Loading stats...</div>

  if (!stats) {
    return <div className="matchStats__empty">{data?.message || "Stats not available yet"}</div>
  }

  return (
    <div className="matchStats">
      {STAT_ORDER.filter((key) => stats.home.stats[key] !== undefined || stats.away.stats[key] !== undefined).map(
        (key) => (
          <StatBar
            key={key}
            label={key}
            homeValue={stats.home.stats[key]}
            awayValue={stats.away.stats[key]}
            homeColor={homeColor}
            awayColor={awayColor}
          />
        )
      )}
    </div>
  )
}