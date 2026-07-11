import useSWR from "swr"
import Image from "next/image"
import { GoalIcon, OwnGoalIcon, MissedPenaltyIcon, SubstitutionIcon, YellowCardIcon, RedCardIcon } from "./EventIcons"

const fetcher = (url) => fetch(url).then((res) => res.json())

function EventIcon({ type, detail }) {
  if (type === "Goal" && detail === "Own Goal") return <OwnGoalIcon size={16} />
  if (type === "Goal" && detail === "Missed Penalty") return <MissedPenaltyIcon size={16} />
  if (type === "Goal") return <GoalIcon size={16} /> // covers "Normal Goal" and "Penalty"
  if (type === "Card" && detail === "Yellow Card") return <YellowCardIcon size={16} />
  if (type === "Card" && detail === "Second Yellow card") return <YellowCardIcon size={16} />
  if (type === "Card" && detail === "Red Card") return <RedCardIcon size={16} />
  if (type === "subst") return <SubstitutionIcon size={16} />
  return <span>•</span>
}

function LiveOrFinishedOverview({ match, matchId, isActive }) {
  const { data: eventsData } = useSWR(
    isActive ? `/api/matches/${matchId}/events?status=${match.status}` : null,
    fetcher,
    { refreshInterval: match.status === "LIVE" ? 30000 : 0 }
  )
  const { data: statsData } = useSWR(
    isActive ? `/api/matches/${matchId}/stats?status=${match.status}` : null,
    fetcher
  )

  const events = eventsData?.data || []
  const stats = statsData?.data

  return (
    <div className="matchOverview">
      <div className="matchOverview__timeline">
        {events.length === 0 && <div className="matchOverview__empty">No events yet</div>}
        {events.map((e, i) => (
          <div key={i} className={`matchOverview__event ${e.team.id === match.teams.home.id ? "home" : "away"}`}>
            <span className="matchOverview__eventTime">{e.time}{e.extraTime ? `+${e.extraTime}` : ""}&apos;</span>
            {e.type !== "subst" && (
              <EventIcon type={e.type} detail={e.detail} />
            )}
            <span style={{ display: "flex", placeItems: 'center', gap: '0.5rem', color: '#cfcfcf' }}>
              {e.player}{e.type === "subst" && e.assist ?
                (
                  <span style={{ display: "flex", placeItems: 'center', gap: '0.5rem' }}>{" "}<EventIcon type={e.type} detail={e.detail} /> {" "} {e.assist}</span>
                ) :
                ""}
            </span>
          </div>
        ))}
      </div>

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

function UpcomingOverview({ match, matchId, isActive }) {
  const { data: h2hData } = useSWR(
    isActive ? `/api/matches/${matchId}/h2h?home=${match.teams.home.id}&away=${match.teams.away.id}` : null,
    fetcher
  )
  const { data: formData } = useSWR(
    isActive ? `/api/matches/${matchId}/form?home=${match.teams.home.id}&away=${match.teams.away.id}` : null,
    fetcher
  )
  const { data: oddsData } = useSWR(isActive ? `/api/matches/${matchId}/odds` : null, fetcher)

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

export default function MatchOverview({ match, active, matchId }) {
  const isActive = active === "Overview"

  if (match.status === "UPCOMING") {
    return <UpcomingOverview match={match} matchId={matchId} isActive={isActive} />
  }
  return <LiveOrFinishedOverview match={match} matchId={matchId} isActive={isActive} />
}
