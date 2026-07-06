import useSWR from "swr"
import Image from "next/image"

const fetcher = (url) => fetch(url).then((res) => res.json())

function EventIcon({ type, detail }) {
  if (type === "Goal") return <span>⚽</span>
  if (type === "Card" && detail === "Yellow Card") return <span style={{ color: "#f5c518" }}>▮</span>
  if (type === "Card" && detail === "Red Card") return <span style={{ color: "#d41b27" }}>▮</span>
  if (type === "subst") return <span>⇄</span>
  return <span>•</span>
}

function LiveOrFinishedOverview({ match, matchId }) {
  const { data: eventsData } = useSWR(
    `/api/matches/${matchId}/events?status=${match.status}`,
    fetcher,
    { refreshInterval: match.status === "LIVE" ? 30000 : 0 }
  )
  const { data: statsData } = useSWR(`/api/matches/${matchId}/stats?status=${match.status}`, fetcher)

  const events = eventsData?.data || []
  const stats = statsData?.data

  return (
    <div className="matchOverview">
      {stats && (
        <div className="matchOverview__statsHighlight">
          <div className="matchOverview__statRow">
            <span>{stats.home.stats["Ball Possession"] || "-"}</span>
            <span className="matchOverview__statLabel">Possession</span>
            <span>{stats.away.stats["Ball Possession"] || "-"}</span>
          </div>
          <div className="matchOverview__statRow">
            <span>{stats.home.stats["Total Shots"] ?? "-"}</span>
            <span className="matchOverview__statLabel">Total Shots</span>
            <span>{stats.away.stats["Total Shots"] ?? "-"}</span>
          </div>
          <div className="matchOverview__statRow">
            <span>{stats.home.stats["Shots on Goal"] ?? "-"}</span>
            <span className="matchOverview__statLabel">On Target</span>
            <span>{stats.away.stats["Shots on Goal"] ?? "-"}</span>
          </div>
        </div>
      )}

      <div className="matchOverview__timeline">
        {events.length === 0 && <div className="matchOverview__empty">No events yet</div>}
        {events.map((e, i) => (
          <div key={i} className={`matchOverview__event ${e.team.id === match.teams.home.id ? "home" : "away"}`}>
            <span className="matchOverview__eventTime">{e.time}{e.extraTime ? `+${e.extraTime}` : ""}&apos;</span>
            <EventIcon type={e.type} detail={e.detail} />
            <span>{e.player}{e.type === "subst" && e.assist ? ` ⇄ ${e.assist}` : ""}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function FormBadges({ form }) {
  return (
    <div className="matchOverview__formBadges">
      {form?.map((f, i) => (
        <span key={i} className={`matchOverview__formBadge ${f.result.toLowerCase()}`} title={`${f.opponent} ${f.score}`}>
          {f.result}
        </span>
      ))}
    </div>
  )
}

function UpcomingOverview({ match, matchId }) {
  const { data: h2hData } = useSWR(
    `/api/matches/${matchId}/h2h?home=${match.teams.home.id}&away=${match.teams.away.id}`,
    fetcher
  )
  const { data: formData } = useSWR(
    `/api/matches/${matchId}/form?home=${match.teams.home.id}&away=${match.teams.away.id}`,
    fetcher
  )
  const { data: oddsData } = useSWR(`/api/matches/${matchId}/odds`, fetcher)

  const h2h = h2hData?.data
  const form = formData?.data
  const odds = oddsData?.data

  return (
    <div className="matchOverview">
      <div className="matchOverview__section">
        <h3>Recent Form</h3>
        <div className="matchOverview__formRow">
          <div>
            <Image src={match.teams.home.logo} alt={match.teams.home.name} width={20} height={20} />
            <FormBadges form={form?.home} />
          </div>
          <div>
            <Image src={match.teams.away.logo} alt={match.teams.away.name} width={20} height={20} />
            <FormBadges form={form?.away} />
          </div>
        </div>
      </div>

      {h2h && (
        <div className="matchOverview__section">
          <h3>Head-to-Head</h3>
          <div className="matchOverview__h2hRecord">
            <span>{h2h.record.homeWins}W</span>
            <span>{h2h.record.draws}D</span>
            <span>{h2h.record.awayWins}W</span>
          </div>
          {h2h.meetings.slice(0, 3).map((m) => (
            <div key={m.id} className="matchOverview__h2hRow">
              <span>{m.teams.home.name} {m.goals.home}-{m.goals.away} {m.teams.away.name}</span>
              <span className="matchOverview__h2hDate">{new Date(m.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}

      {(odds?.prediction || odds?.odds) && (
        <div className="matchOverview__section">
          <h3>Prediction &amp; Odds</h3>
          {odds.prediction && (
            <div className="matchOverview__predictionBars">
              <div>Home {odds.prediction.homeWinPercent}</div>
              <div>Draw {odds.prediction.drawPercent}</div>
              <div>Away {odds.prediction.awayWinPercent}</div>
            </div>
          )}
          {odds.odds && (
            <div className="matchOverview__oddsRow">
              {odds.odds.values.map((v) => (
                <div key={v.value}>
                  <span>{v.value}</span>
                  <span>{v.odd}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function MatchOverview({ match, matchId }) {
  if (match.status === "UPCOMING") {
    return <UpcomingOverview match={match} matchId={matchId} />
  }
  return <LiveOrFinishedOverview match={match} matchId={matchId} />
}
