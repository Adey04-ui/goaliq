import Image from "next/image"

function MatchRow({ match, isFavourite, onToggleFavourite }) {
  const isScheduled = match.status === "UPCOMING"

  return (
    <div className="each-match">
      <div className={isScheduled ? "time-2" : "time"}>
        {isScheduled
          ? new Date(match.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
          : match.status === "LIVE"
          ? `${match.elapsed}'`
          : "FT"}
      </div>
      <div className="teams">
        <div className="home-team">
          <Image height={20} width={20} src={match.teams.home.logo} alt="team_logo" className="team-logo" />
          <span>{match.teams.home.name}</span>
        </div>
        {isScheduled ? (
          <div className="vs">vs</div>
        ) : (
          <div className="scores">
            {match.goals.home} - {match.goals.away}
          </div>
        )}
        <div className="away-team">
          <Image height={20} width={20} src={match.teams.away.logo} alt="team_logo" className="team-logo" />
          <span>{match.teams.away.name}</span>
        </div>
      </div>
      <div className="favourite-btn" onClick={() => onToggleFavourite(match)}>
        {isScheduled ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" className="favourite-svg">
            <path d="M10 2C10 2 5 4 5 10V15L3 17H17L15 15V10C15 4 10 2 10 2Z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" />
            <path d="M8 17C8 18.1 8.9 19 10 19C11.1 19 12 18.1 12 17" stroke="white" strokeWidth="1.5" />
            <line x1="10" y1="1" x2="10" y2="3" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg
            style={{ strokeWidth: 1, height: 22, width: 22, stroke: "#fff" }}
            viewBox="0 0 24 24"
            className={`favourite-svg${isFavourite ? " filled" : ""}`}
          >
            <polygon points="12 3 15 9 22 9 17 14 19 21 12 17 5 21 7 14 2 9 9 9" />
          </svg>
        )}
      </div>
    </div>
  )
}

export default MatchRow
