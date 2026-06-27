import useSWR from "swr"
import Image from "next/image"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

export default function Knockout({ league, season, active }) {
  const { data, isLoading } = useSWR(
    active === "Knockout" && league
      ? `/api/knockout?league=${league.league.id}&season=${season}`
      : null,
    fetcher,
    {
      dedupingInterval: 60000,
      revalidateOnFocus: false,
    }
  )

  const rounds = data?.data || []

  if (isLoading) {
    return (
      <div className="knockoutContainer">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="knockout__roundSkeleton">
            <div className="knockout__labelSkeleton" />
            <div className="knockout__matchesSkeleton">
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="knockout__matchSkeleton" />
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (!rounds.length) {
    return (
      <div className="knockoutContainer">
        <div className="knockout__empty">
          No knockout data available
        </div>
      </div>
    )
  }

  // Sort rounds in logical order
  const ROUND_ORDER = [
    "round of 32",
    "round of 16",
    "quarter-finals",
    "semi-finals",
    "3rd place final",
    "final",
  ]

  const sorted = [...rounds].sort((a, b) => {
    const ai = ROUND_ORDER.findIndex((r) =>
      a.round.toLowerCase().includes(r)
    )
    const bi = ROUND_ORDER.findIndex((r) =>
      b.round.toLowerCase().includes(r)
    )
    return ai - bi
  })

  return (
    <div className="knockoutContainer">
      {sorted.map((round) => (
        <div key={round.round} className="knockout__round">

          <div className="knockout__roundLabel">
            {round.round}
          </div>

          <div className="knockout__matches">
            {round.matches.map((match) => {
              const homeWinner = match.teams.home.winner === true
              const awayWinner = match.teams.away.winner === true
              const isUpcoming = match.goals.home === null

              return (
                <div key={match.fixture.id} className="knockout__match">

                  <div className={`knockout__team ${homeWinner ? "winner" : ""} ${awayWinner ? "loser" : ""} ${isUpcoming ? "upcoming" : ""}`}>
                    {match.teams.home.logo ? (
                      <Image
                        src={match.teams.home.logo}
                        alt={match.teams.home.name}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <div className="knockout__teamPlaceholder" />
                    )}
                    <span className="knockout__teamName">
                      {match.teams.home.name || "TBD"}
                    </span>
                    <span className="knockout__score">
                      {isUpcoming ? "—" : match.goals.home}
                    </span>
                  </div>

                  <div className={`knockout__team ${awayWinner ? "winner" : ""} ${homeWinner ? "loser" : ""} ${isUpcoming ? "upcoming" : ""}`}>
                    {match.teams.away.logo ? (
                      <Image
                        src={match.teams.away.logo}
                        alt={match.teams.away.name}
                        width={20}
                        height={20}
                      />
                    ) : (
                      <div className="knockout__teamPlaceholder" />
                    )}
                    <span className="knockout__teamName">
                      {match.teams.away.name || "TBD"}
                    </span>
                    <span className="knockout__score">
                      {isUpcoming ? "—" : match.goals.away}
                    </span>
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      ))}
    </div>
  )
}