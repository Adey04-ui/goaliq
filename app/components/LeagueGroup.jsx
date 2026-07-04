import Image from "next/image"
import MatchRow from "./MatchRow"

function LeagueGroup({ group, favouriteIds, onToggleFavourite }) {
  return (
    <div className="matches">
      <div className="league-group-header">
        <div className="name">
          <Image height={26} width={26} src={group.league.logo} alt="league_logo" className="league-logo" />
          <span>{group.league.name}</span>
        </div>
        <div className="country">
          <span>{group.league.country}</span>
        </div>
      </div>
      {group.matches.map((match) => (
        <MatchRow
          key={match.id}
          match={match}
          isFavourite={favouriteIds.has(String(match.id))}
          onToggleFavourite={onToggleFavourite}
        />
      ))}
    </div>
  )
}

export default LeagueGroup
