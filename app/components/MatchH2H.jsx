import useSWR from "swr"
import Image from "next/image"

const fetcher = (url) => fetch(url).then((res) => res.json())

export default function MatchH2H({ match, matchId, active }) {
  const { data, isLoading } = useSWR(
    active === "H2H" ? `/api/matches/${matchId}/h2h?home=${match.teams.home.id}&away=${match.teams.away.id}` : null,
    fetcher
  )

  const h2h = data?.data

  if (isLoading) return <div className="matchH2H__empty">Loading head-to-head...</div>

  if (!h2h || h2h.meetings.length === 0) {
    return <div className="matchH2H__empty">No previous meetings found</div>
  }

  return (
    <div className="matchH2H">
      <div className="matchH2H__record">
        <div>
          <Image src={match.teams.home.logo} alt={match.teams.home.name} width={20} height={20} />
          <span>{h2h.record.homeWins} Wins</span>
        </div>
        <div>{h2h.record.draws} Draws</div>
        <div>
          <span>{h2h.record.awayWins} Wins</span>
          <Image src={match.teams.away.logo} alt={match.teams.away.name} width={20} height={20} />
        </div>
      </div>

      <div className="matchH2H__list">
        {h2h.meetings.map((m) => (
          <div key={m.id} className="matchH2H__row">
            <span className="matchH2H__date">{new Date(m.date).toLocaleDateString()}</span>
            <div className="matchH2H__teams">
              <Image src={m.teams.home.logo} alt={m.teams.home.name} width={18} height={18} />
              <span>{m.teams.home.name}</span>
              <span className="matchH2H__score">{m.goals.home} - {m.goals.away}</span>
              <span>{m.teams.away.name}</span>
              <Image src={m.teams.away.logo} alt={m.teams.away.name} width={18} height={18} />
            </div>
            <span className="matchH2H__league">{m.league}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
