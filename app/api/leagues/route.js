import { CONTINENTS } from "../continents"

const topLeagues = [39, 140, 78, 135, 61, 2, 3, 4, 5, 6]

export async function GET(request) {
  try {
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

    if (!res.ok) {
      return Response.json(
        {
          success: false,
          message: "Failed to fetch leagues from API Football",
        },
        {
          status: res.status,
        }
      )
    }

    const data = await res.json()

    if (!data.response) {
      return Response.json(
        {
          success: false,
          message: "No league data returned",
        },
        {
          status: 404,
        }
      )
    }

    const leagues = data.response

    let filteredLeagues = leagues

    switch (filter) {
      case "topLeagues":
        filteredLeagues = leagues.filter((l) =>
          topLeagues.includes(l.league.id)
        )
        break

      case "africa":
        filteredLeagues = leagues.filter((l) =>
          CONTINENTS.africa.includes(l.country.name)
        )
        break

      case "asia":
        filteredLeagues = leagues.filter((l) =>
          CONTINENTS.asia.includes(l.country.name)
        )
        break

      case "europe":
        filteredLeagues = leagues.filter((l) =>
          CONTINENTS.europe.includes(l.country.name)
        )
        break

      case "north-america":
        filteredLeagues = leagues.filter((l) =>
          CONTINENTS.northAmerica.includes(l.country.name)
        )
        break

      case "south-america":
        filteredLeagues = leagues.filter((l) =>
          CONTINENTS.southAmerica.includes(l.country.name)
        )
        break

      case "oceania":
        filteredLeagues = leagues.filter((l) =>
          CONTINENTS.oceania.includes(l.country.name)
        )
        break
    }

    return Response.json({
      success: true,
      data: filteredLeagues,
    })
  } catch (error) {
    console.error("Leagues API Error:", error)

    return Response.json(
      {
        success: false,
        message: error.message || "Something went wrong",
      },
      {
        status: 500,
      }
    )
  }
}