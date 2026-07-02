// app/main/team/[teamId]/TeamOverview.jsx
import useSWR from "swr"
import Image from "next/image"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

export default function TeamOverview({ team, active, teamId }) {
  // News — only loads when Overview tab is active
  const { data: newsData, isLoading: newsLoading } = useSWR(
    active === "Overview"
      ? `/api/news?q=${encodeURIComponent(team.team.name)}&max=3`
      : null,
    fetcher
  )

  // Fixtures — reused for next match + recent form
  const { data: fixturesData, isLoading: fixturesLoading } = useSWR(
    active === "Overview"
      ? `/api/teams/${teamId}/fixtures`
      : null,
    fetcher
  )

  const news = newsData?.data ?? []
  const nextFixture = fixturesData?.data?.fixtures?.[0]
  const recentResults = (fixturesData?.data?.results ?? []).slice(0, 5)

  return (
    <div className="teamOverview">
      {/* Next fixture */}
      {fixturesLoading ? (
        <div className="teamOverview__skeleton" style={{ height: 80 }} />
      ) : nextFixture && (
        <div className="teamOverview__nextFixture">
          <span className="teamOverview__sectionLabel">Next match</span>
          <div className="teamOverview__matchRow">
            <Image src={nextFixture.teams.home.logo} alt="" width={28} height={28} />
            <span>{nextFixture.teams.home.name}</span>
            <span className="teamOverview__vs">vs</span>
            <span>{nextFixture.teams.away.name}</span>
            <Image src={nextFixture.teams.away.logo} alt="" width={28} height={28} />
          </div>
        </div>
      )}

      {/* Recent form */}
      {!fixturesLoading && recentResults.length > 0 && (
        <div className="teamOverview__form">
          <span className="teamOverview__sectionLabel">Recent form</span>
          <div className="teamOverview__formRow">
            {recentResults.map(match => {
              const isHome = match.teams.home.id === team.team.id
              const teamGoals = isHome ? match.goals.home : match.goals.away
              const oppGoals = isHome ? match.goals.away : match.goals.home
              const result = teamGoals > oppGoals ? "W" : teamGoals < oppGoals ? "L" : "D"

              return (
                <span key={match.fixture.id} className={`teamOverview__formBadge teamOverview__formBadge--${result}`}>
                  {result}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* News */}
      <div className="teamOverview__news">
        <span className="teamOverview__sectionLabel">Latest news</span>
        {newsLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="teamOverview__skeleton" style={{ height: 60 }} />
          ))
        ) : (
          news.map(article => (
            <a
              key={article.url}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="teamOverview__newsRow"
            >
              {article.image && (
                <Image src={article.image} alt="" width={60} height={44} style={{ objectFit: "cover", borderRadius: 6 }} />
              )}
              <p>{article.title}</p>
            </a>
          ))
        )}
      </div>
    </div>
  )
}