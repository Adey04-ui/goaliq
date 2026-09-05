"use client"

import useSWR from "swr"
import { useParams, useRouter, useSearchParams } from "next/navigation"
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

export default function LeaguePage() {
  const router = useRouter()

  // useParams()/useSearchParams() instead of the params/searchParams PROPS:
  // MatchPage.js already does this for its route param (useParams -> matchId),
  // and NewsPage.js does the same for query params (searchParams.get("q")).
  // The prop-based versions weren't behaving reliably here, which is why
  // leagueId was coming through undefined -> the SWR key was null -> no
  // fetch ever fired -> immediate "League not found".
  const params = useParams()
  const searchParams = useSearchParams()

  // If this is still undefined, the dynamic route folder likely isn't
  // literally named [id] - useParams() keys are named after the folder's
  // bracket segment, so a folder named [leagueId] would need params.leagueId
  // instead.
  const leagueId = params?.id

  const season = searchParams.get("season") || String(new Date().getFullYear())

  // Optional query params a linking page can pass if it already has this
  // data on hand (e.g. from a fixture's `league` object), so the header can
  // paint immediately instead of waiting on the fetch below.
  const qName = searchParams.get("name")
  const qLogo = searchParams.get("logo")
  const qCountryName = searchParams.get("countryName")
  const qCountryFlag = searchParams.get("countryFlag")
  const qType = searchParams.get("type")

  const optimisticLeague = qName
    ? {
        league: { id: leagueId, name: qName, logo: qLogo, type: qType },
        country: { name: qCountryName, flag: qCountryFlag },
      }
    : null

  // Same URL/key that Standings itself fetches internally for the actual
  // standings table - SWR dedupes this into a single request, we're just
  // also reading the nested `league` metadata off the same response.
  const { data, error, isLoading } = useSWR(
    leagueId ? `/api/standings?league=${leagueId}&season=${season}` : null,
    fetcher,
    { dedupingInterval: 60000, revalidateOnFocus: false }
  )

  if (error) {
    // Surfaced to the console rather than swallowed - if the endpoint itself
    // is erroring (bad league id, season with no data, server error, etc.)
    // this tells you that instead of leaving you guessing between "no id"
    // and "fetch failed".
    console.error("Failed to load league standings:", error)
  }

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
    if (!leagueId) {
      // Dev-time signal, not meant to be a friendly user-facing state -
      // if you're seeing this, check the dynamic folder name (see comment
      // on leagueId above).
      return (
        <div className="parent-container">
          <div className="matchEmpty">No league id in the URL - check the dynamic route folder name.</div>
        </div>
      )
    }
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
        <div className="matchEmpty">
          {error ? "Couldn't load this league right now." : "League not found"}
        </div>
      </div>
    )
  }

  return (
    <div className="parent-container">
      <Standings league={league} season={season} onBack={() => router.back()} />
    </div>
  )
}