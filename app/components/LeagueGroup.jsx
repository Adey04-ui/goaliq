import Image from "next/image"
import MatchRow from "./MatchRow"

function LeagueGroup({ group, favouriteIds, onToggleFavourite }) {
  return (
    <div className="matches">
      <div className="league-group-header">
        <Image height={16} width={16} src={group.league.logo} alt="league_logo" className="league-logo" />
        <span>{group.league.name}</span>
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
