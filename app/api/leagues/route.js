import { CONTINENTS } from "../continents"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { getLeagues } from "@/services/leaguesCache"

const topLeagues = [39, 140, 78, 135, 61, 2, 3, 4, 5, 6]

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const filter = searchParams.get("filter")

    console.time("getLeagues")

    const leagues = await getLeagues()

    console.timeEnd("getLeagues")

    let filteredLeagues = leagues

    switch (filter) {
      case "top_leagues":
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

      case "favorites": {
        const session = await getServerSession(authOptions)

        if (!session?.user?.email) {
          return Response.json(
            { success: false, message: "Not authenticated" },
            { status: 401 }
          )
        }

        const user = await prisma.user.findUnique({
          where: {
            email: session.user.email,
          },
        })

        if (!user) {
          return Response.json(
            { success: false, message: "User not found" },
            { status: 404 }
          )
        }

        const favorites = await prisma.favorite.findMany({
          where: {
            userId: user.id,
            type: "LEAGUE",
          },
        })

        const favIds = new Set(
          favorites.map((f) => Number(f.itemId))
        )

        filteredLeagues = leagues.filter((l) =>
          favIds.has(l.league.id)
        )

        break
      }
    }

    return Response.json({
      success: true,
      data: filteredLeagues,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    )
  }
}