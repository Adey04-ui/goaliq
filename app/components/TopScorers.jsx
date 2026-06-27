import useSWR from "swr"
import Image from "next/image"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

function TopScorers({ league, season, active }) {
  const { data, isLoading } = useSWR(
    active === "Top Scorers" && league
      ? `/api/topScorers?league=${league.league.id}&season=${season}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  const scorers = data?.data || []

  if (isLoading) {
    return (
      <div className="topScorersContainer">
        <div className="topScorers__header">
          <span>#</span>
          <span>PLAYER</span>
          <span>TEAM</span>
          <span>GOALS</span>
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="topScorers__skeleton" />
        ))}
      </div>
    )
  }

  return (
    <div className="topScorersContainer">
      {/* Table header */}
      <div className="topScorers__header">
        <span>#</span>
        <span>PLAYER</span>
        <span>TEAM</span>
        <span>GOALS</span>
      </div>

      {scorers.map((entry, index) => (
        <div className="topScorers__row" key={entry.player.id}>

          {/* Rank */}
          <div className="topScorers__rank">
            {index + 1}
          </div>

          {/* Player */}
          <div className="topScorers__player">
            <div className="topScorers__player-photo">
              <Image
                src={entry.player.photo}
                alt={entry.player.name}
                width={40}
                height={40}
              />
            </div>
            <div className="topScorers__player-info">
              <span className="topScorers__player-name">
                {entry.player.name}
              </span>
              <span className="topScorers__player-sub">
                Goals (Penalties)
              </span>
            </div>
          </div>

          {/* Team */}
          <div className="topScorers__team">
            <Image
              src={entry.statistics[0].team.logo}
              alt={entry.statistics[0].team.name}
              width={22}
              height={22}
            />
            <span>{entry.statistics[0].team.name}</span>
          </div>

          {/* Goals */}
          <div className="topScorers__goals">
            <span className="topScorers__goals-total">
              {entry.statistics[0].goals.total}
            </span>
            <span className="topScorers__goals-penalties">
              ({entry.statistics[0].goals.saves ?? entry.statistics[0].penalty.scored ?? 0})
            </span>
          </div>

        </div>
      ))}
    </div>
  )
}

export default TopScorers