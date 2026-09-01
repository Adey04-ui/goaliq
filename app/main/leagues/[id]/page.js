"use client"

import useSWR from "swr"
import { useRouter } from "next/navigation"
// TODO: adjust this import to wherever Standings.jsx actually lives in your
// project (LeaguesComponent imports it as "./Standings", so it's a sibling
// of LeaguesComponent.jsx - point this at that same folder).
import Standings from "@/app/components/Standings"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

export default function LeaguePage({ params, searchParams }) {
  const router = useRouter()
  const leagueId = params.id

  // A season is required to fetch standings. Pass it in the link from
  // wherever you navigate here from, e.g.
  //   /main/leagues/${match.league.id}?season=${match.league.season}
  // Falling back to the current year only covers direct navigation without
  // a season (bookmarks, manual URL entry) - it won't always be right for
  // competitions whose season doesn't match the calendar year.
  const season = searchParams?.season || String(new Date().getFullYear())

  // Optional query params a linking page can pass if it already has this
  // data on hand (e.g. from a fixture's `league` object), so the header can
  // paint immediately instead of waiting on the fetch below.
  const {
    name: qName,
    logo: qLogo,
    countryName: qCountryName,
    countryFlag: qCountryFlag,
    type: qType,
  } = searchParams || {}

  const optimisticLeague = qName
    ? {
        league: { id: leagueId, name: qName, logo: qLogo, type: qType },
        country: { name: qCountryName, flag: qCountryFlag },
      }
    : null

  // Same URL/key that Standings itself fetches internally for the actual
  // standings table - SWR dedupes this into a single request, we're just
  // also reading the nested `league` metadata off the same response.
  const { data, isLoading } = useSWR(
    leagueId ? `/api/standings?league=${leagueId}&season=${season}` : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnFocus: false }
  )

  const leagueInfo = data?.data?.[0]?.league

  const fetchedLeague = leagueInfo
    ? {
        league: {
          id: leagueInfo.id,
          name: leagueInfo.name,
          logo: leagueInfo.logo,
          // Standings responses from API-Football don't reliably include a
          // "type" (League/Cup) field the way fixture/league-list endpoints
          // do, so fall back to whatever the linking page passed via
          // ?type=. If neither is present, Standings' own fallback logic
          // treats it as a regular league (Standings/Results/Fixtures/Top
          // Scorers, no Groups/Knockout tabs) - fine for leagues, wrong for
          // a cup competition reached this way. Pass ?type=Cup from the
          // linking page if you have it, to get Knockout tabs right.
          type: leagueInfo.type || qType,
        },
        country: {
          name: leagueInfo.country,
          flag: leagueInfo.flag,
        },
      }
    : null

  const league = fetchedLeague || optimisticLeague

  if (!league) {
    if (isLoading) {
      return (
        <div className="parent-container">
          <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "24px 0" }}>
            <div className="skeleton-pulse" style={{ width: 50, height: 50, borderRadius: 10 }} />
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div className="skeleton-pulse" style={{ width: 180, height: 18, borderRadius: 6 }} />
              <div className="skeleton-pulse" style={{ width: 120, height: 13, borderRadius: 6 }} />
            </div>
          </div>
        </div>
      )
    }
    return (
      <div className="parent-container">
        <div className="matchEmpty">League not found</div>
      </div>
    )
  }

  return (
    <div className="parent-container">
      <Standings league={league} season={season} onBack={() => router.back()} />
    </div>
  )
}