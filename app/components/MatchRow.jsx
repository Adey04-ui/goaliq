import Image from "next/image"
import { formatMatchTime } from "@/lib/matchTime"

function MatchRow({ match, isFavourite, onToggleFavourite }) {

  const isScheduled = match?.status === "UPCOMING"

  console.log("match: ", match)

  return (
    <div className="eachMatch" key={match.id}>

      <div className="timestamp">
        <span className={`time ${match.status === "LIVE" ? "live" : ""}`}>
          {new Date(match.date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          })}
        </span>
        <span className="timezone">
          {/* e.g. GMT+1 */}
          {`${new Date().toLocaleString("en-US", { timeZoneName: "short" }).split(" ").pop().replace("UTC", "GMT")}`}
        </span>
      </div>

      {/* Home team */}
      <div className="home">
        <Image
          src={match.teams.home.logo}
          alt={match.teams.home.name}
          width={28}
          height={28}
        />
        <span>{match.teams.home.name.slice(0, 14)}</span>
      </div>

      {/* Scoreline */}
      <div className="scoreline">
        <span className="score">
          {match.goals.home} - {match.goals.away}
        </span>
        <span className="status">
          {isScheduled
          ? formatMatchTime(match.date)
          : match.status === "LIVE"
          ? `${match.elapsed}'`
          : "FT"}
        </span>
      </div>

      {/* Away team */}
      <div className="away">
        <Image
          src={match.teams.away.logo}
          alt={match.teams.away.name}
          width={28}
          height={28}
        />
        <span>{match.teams.away.name.length > 14 ? match.teams.away.name.slice(0, 14) + "..." : match.teams.away.name}</span>
      </div>

      {/* Favourite */}
      <div
        className="favourite-btn"
        onClick={(e) => {
          e.stopPropagation()
          onToggleFavourite(match)
        }}
      >
        <svg
          style={{ strokeWidth: 1, height: 20, width: 20, stroke: "#888" }}
          viewBox="0 0 24 24"
          className={`favourite-svg ${isFavourite ? "filled" : ""}`}
        >
          <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
        </svg>
      </div>

    </div>
  )
}

export default MatchRow
