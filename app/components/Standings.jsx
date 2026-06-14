import useSWR from "swr"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"

const tabs = ["Standings", "Fixtures", "Top Scorers", "Stats"]

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message)
  }

  return result
}

export default function Standings({ league, onBack, season }) {
  const [active, setActive] = useState("Standings")
  const [selectedGroup, setSelectedGroup] = useState(0)
  const {
    data,
    isLoading,
  } = useSWR(
    league
      ? `/api/standings?league=${league.league.id}&season=${season}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  const standings =
    data?.[0]?.league?.standings?.[0] || []

  const standingsGroups =
    data?.[0]?.league?.standings || []

  const hasGroups = standingsGroups.length > 1

  const displayedStandings = hasGroups
    ? standingsGroups[selectedGroup]
    : standingsGroups[0] || []

  console.log(league)
  console.log("selected from standings", season)
  console.log(data)

  if (!league) return null
  return (
    <div className="standingsContainer">

      <div className="standingsHeader">
        <button
          className="backBtn"
          onClick={onBack}
        >
          <ArrowLeft size={21} />
        </button>

        <div className="leagueInfo">
          <Image
            src={league.league.logo}
            alt={league.league.name}
            width={50}
            height={50}
          />

          <div>
            <h2>{league.league.name}</h2>
            <span>
              <Image src={league.country.flag} alt={league.country.name} width={17} height={17} />
              {league.country.name}
            </span>
          </div>
        </div>
      </div>

      <div className="standingsTabs">
        {tabs.map((tab) => (
          <button
            key={tab}
            className="tabButton"
            onClick={() => setActive(tab)}
          >
            {tab}

            {active === tab && (
              <motion.div
                layoutId="underline"
                className="underline"
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
        {displayedStandings?.map((team) => (
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
        ))}
      </div>

    </div>
  )
}