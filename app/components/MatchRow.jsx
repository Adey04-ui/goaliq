import Image from "next/image"
import Link from "next/link"
import { useUser } from "@/context/userContext"
import { useFormatMatchTime, useLocale, useUserTimezone } from "@/lib/preferences"

function MatchRow({ match, isFavourite, onToggleFavourite }) {
  const isScheduled = match?.status === "UPCOMING"
  const { preferences } = useUser()
  const formatMatchTime = useFormatMatchTime()
  const locale = useLocale()
  const timeZone = useUserTimezone()
  const dataSaver = preferences?.dataSaver ?? false

  const matchDate = match.fixture?.date ?? match.date
  const matchStatus = match.fixture?.status?.short ?? match.status

  const tzAbbr = timeZone
    ? new Date().toLocaleString(locale, { timeZone, timeZoneName: "short" }).split(" ").pop().replace("UTC", "GMT")
    : new Date().toLocaleString(locale, { timeZoneName: "short" }).split(" ").pop().replace("UTC", "GMT")

  return (
    <Link href={`/main/matches/${match.id ?? match.fixture?.id}`} className="matchRow">
      <div className="eachMatch" key={match.id ?? match.fixture?.id}>
        <div className="timestamp">
          <span className={`time ${matchStatus === "LIVE" ? "live" : ""}`}>
            {formatMatchTime(matchDate) ?? (matchStatus === "FT" ? "FT" : "--")}
          </span>
          <span className="timezone">{tzAbbr}</span>
        </div>

        <div className="home">
          {!dataSaver && (
            <Image
              src={match.teams.home.logo}
              alt={match.teams.home.name}
              width={28}
              height={28}
              className="matchRow__logo"
            />
          )}
          <span>{match.teams.home.name.length > 14 ? match.teams.home.name.slice(0, 14) + "..." : match.teams.home.name}</span>
          {/* Only visible in the collapsed (narrow-container) layout */}
          <span className="inlineScore">{match.goals.home}</span>
        </div>

        <div className="scoreline">
          <span className="score">
            {match.goals.home} - {match.goals.away}
          </span>
          <span className={`status ${matchStatus === "LIVE" ? "live" : ""}`}>
            {isScheduled
              ? formatMatchTime(matchDate)
              : matchStatus === "LIVE"
                ? `${match.elapsed}'`
                : "FT"}
          </span>
        </div>

        <div className="away">
          {!dataSaver && (
            <Image
              src={match.teams.away.logo}
              alt={match.teams.away.name}
              width={28}
              height={28}
              className="matchRow__logo"
            />
          )}
          <span>{match.teams.away.name.length > 14 ? match.teams.away.name.slice(0, 14) + "..." : match.teams.away.name}</span>
          {/* Only visible in the collapsed (narrow-container) layout */}
          <span className="inlineScore">{match.goals.away}</span>
        </div>

        <div
          className="favourite-btn"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onToggleFavourite(match)
          }}
        >
          <svg
            viewBox="0 0 24 24"
            className={`favourite-svg ${isFavourite ? "filled" : ""}`}
          >
            <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
          </svg>
        </div>
      </div>
    </Link>
  )
}

export default MatchRow