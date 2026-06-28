import { motion } from "framer-motion"
import Image from "next/image"
import StandingsSkeleton from "./StandingsSkeleton"

function StandingsTable({ hasGroups, standingsGroups, selectedGroup, setSelectedGroup, displayedStandings, isLoading }) {
  console.log("standings group", standingsGroups)
  return (
    <div className="standingsL">
      {
        hasGroups && (
          <div className="groupSelector">
            {standingsGroups.map((group, index) => (
              <button
                key={index}
                className="groupButton"
                onClick={() => setSelectedGroup(index)}
              >
                {group[0].group}

                {selectedGroup === index && (
                  <motion.div
                    layoutId="groupUnderline"
                    className="groupUnderline"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 35,
                    }}
                  />
                )}
              </button>
            ))}
          </div>
        )
      }

      <div className="tableHeader">
        <span>#</span>
        <span className="teamColumn">
          Team
        </span>
        <span>P</span>
        <span>W</span>
        <span>D</span>
        <span>L</span>
        <span>GD</span>
        <span>PTS</span>
      </div>

      <div className="standingsRows">
        {!isLoading ? displayedStandings?.map((team) => (
          <div
            className="standingRow"
            key={team.team.id}
          >

            <div
              className={`qualificationMarker ${team.rank <= 4
                ? "ucl"
                : team.rank === 5
                  ? "uel"
                  : team.rank >= 18
                    ? "relegation"
                    : ""
                }`}
            />

            <span className="teamRank">
              {team.rank}
            </span>

            <div className="teamColumn">
              <Image
                src={team.team.logo}
                alt={team.team.name}
                width={24}
                height={24}
              />

              <span>
                {team.team.name}
              </span>
            </div>

            <span>{team.all.played}</span>
            <span>{team.all.win}</span>
            <span>{team.all.draw}</span>
            <span>{team.all.lose}</span>
            <span>{team.goalsDiff}</span>
            <span className="points">
              {team.points}
            </span>
          </div>
        )) : (
          Array.from({ length: 7 }).map((_, i) => (
            <StandingsSkeleton key={i} />
          ))
        )}
      </div>
    </div>
  )
}

export default StandingsTable