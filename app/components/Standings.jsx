import useSWR from "swr"
import Image from "next/image"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"
import { useState } from "react"
import StandingsTable from "./StandingsTable"
import Fixtures from "./Fixtures"
import Results from "./Results"
import TopScorers from "./TopScorers"
import Knockout from "./Knockout"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

export default function Standings({ league, onBack, season }) {
  const [active, setActive] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(0)

  const { data, isLoading } = useSWR(
    league
      ? `/api/standings?league=${league.league.id}&season=${season}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  const standingsGroups = data?.[0]?.league?.standings || []
  const competitionType = league?.league?.type
  const hasGroups = standingsGroups.length > 1
  const hasStandings = standingsGroups.length > 0 // new check

  const isLeague = competitionType === "League"
  const isCup = competitionType === "Cup"
  const isCupWithGroups = isCup && hasGroups
  const isCupWithStandings = isCup && hasStandings && !hasGroups // new — Champions League 2024 case
  const isKnockoutOnly = isCup && !hasStandings // truly no table at all

  const tabs = isLeague
    ? ["Standings", "Results", "Fixtures", "Top Scorers"]
    : isCupWithGroups
      ? ["Groups", "Knockout", "Results", "Fixtures", "Top Scorers"]
      : isCupWithStandings
        ? ["Standings", "Knockout", "Results", "Fixtures", "Top Scorers"] // CL 2024+
        : isKnockoutOnly
          ? ["Knockout", "Results", "Fixtures", "Top Scorers"]
          : ["Standings", "Results", "Fixtures", "Top Scorers"] // fallback


  const resolvedActive = active ?? tabs[0]
  const activeIndex = tabs.indexOf(resolvedActive)

  const displayedStandings = hasGroups
    ? standingsGroups[selectedGroup]
    : standingsGroups[0] || []

  if (!league) return null

  return (
    <div className="standingsContainer">
      <div className="standingsHeader">
        <button className="backBtn" onClick={onBack}>
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
              <Image
                src={league.country.flag}
                alt={league.country.name}
                width={17}
                height={17}
              />
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
            {resolvedActive === tab && (
              <motion.div
                layoutId="underline"
                className="underline"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        ))}
      </div>

      <div className="contentViewport">
        <motion.div
          className="contentSlider"
          animate={{ x: `-${activeIndex * 100}%` }}
          transition={{ type: "spring", stiffness: 250, damping: 30 }}
        >
          {/* Panel 1 — Standings (league) or Groups (cup with groups) */}
          {(isLeague || isCupWithGroups || isCupWithStandings || !competitionType) && (
            <div className="panel">
              <StandingsTable
                hasGroups={hasGroups}
                standingsGroups={standingsGroups}
                selectedGroup={selectedGroup}
                setSelectedGroup={setSelectedGroup}
                displayedStandings={displayedStandings}
                active={resolvedActive}
                isLoading={isLoading}
              />
            </div>
          )}

          {/* Knockout panel — cups only */}
          {(isCup) && (
            <div className="panel">
              <Knockout
                league={league}
                season={season}
                active={resolvedActive}
              />
            </div>
          )}

          {/* These three are always present */}
          <div className="panel">
            <Results season={season} league={league} active={resolvedActive} />
          </div>

          <div className="panel">
            <Fixtures season={season} league={league} active={resolvedActive} />
          </div>

          <div className="panel">
            <TopScorers league={league} season={season} active={resolvedActive} />
          </div>
        </motion.div>
      </div>
    </div>
  )
}