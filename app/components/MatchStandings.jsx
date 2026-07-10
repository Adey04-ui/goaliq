import useSWR from "swr"
import Image from "next/image"

const fetcher = (url) => fetch(url).then((res) => res.json())
 
export default function MatchStandings({ match, matchId, active }) {
  const { data, isLoading } = useSWR(
    active === "Standings" ? `/api/matches/${matchId}/standings?league=${match.league.id}&season=${match.league.season}` : null,
    fetcher
  )

  const groups = data?.data

  if (isLoading) return <div className="matchStandings__empty">Loading standings...</div>

  if (!groups || groups.length === 0) {
    return <div className="matchStandings__empty">Standings not available for this competition</div>
  }

  const homeId = match.teams.home.id
  const awayId = match.teams.away.id

  return (
    <div className="matchStandings">
      {groups.map((group, gi) => (
        <table key={gi} className="matchStandings__table">
          <thead>
            <tr>
              <th>#</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {group.map((row) => {
              const isMatchTeam = row.team.id === homeId || row.team.id === awayId
              return (
                <tr key={row.team.id} className={isMatchTeam ? "matchStandings__highlight" : ""}>
                  <td>{row.rank}</td>
                  <td className="matchStandings__teamCell">
                    <Image src={row.team.logo} alt={row.team.name} width={18} height={18} />
                    {row.team.name}
                  </td>
                  <td>{row.played}</td>
                  <td>{row.win}</td>
                  <td>{row.draw}</td>
                  <td>{row.lose}</td>
                  <td>{row.goalsDiff}</td>
                  <td>{row.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ))}
    </div>
  )
}
