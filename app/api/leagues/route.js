import { CONTINENTS } from "../continents"

const topLeagues = [39, 140, 78, 135, 61, 2, 3, 4, 5, 6]

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  const filter = searchParams.get("filter")

  const res = await fetch(
    "https://v3.football.api-sports.io/leagues",
    {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
    }
  )

  const data = await res.json()

  const leagues = data.response

  let filteredLeagues = leagues

  switch (filter) {
    case "topLeagues":
      filteredLeagues = leagues.filter(l =>
        topLeagues.includes(l.league.id)
      )
      break

    case "africa":
      filteredLeagues = leagues.filter(l =>
        CONTINENTS.africa.includes(l.country.name)
      )
      break

    case "asia":
      filteredLeagues = leagues.filter(l =>
        CONTINENTS.asia.includes(l.country.name)
      )
      break

    case "europe":
      filteredLeagues = leagues.filter(l =>
        CONTINENTS.europe.includes(l.country.name)
      )
      break

    case "north-america":
      filteredLeagues = leagues.filter(l =>
        CONTINENTS.northAmerica.includes(l.country.name)
      )
      break

    case "south-america":
      filteredLeagues = leagues.filter(l =>
        CONTINENTS.southAmerica.includes(l.country.name)
      )
      break

    case "oceania":
      filteredLeagues = leagues.filter(l =>
        CONTINENTS.oceania.includes(l.country.name)
      )
      break
  }

  return Response.json(filteredLeagues)
}