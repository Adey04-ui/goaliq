import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import {
  getFilteredLeagues,
  getPaginatedLeagues,
} from "@/services/leaguesCache"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") ?? "top_leagues"
    const page = Number(searchParams.get("page") ?? 0)

    // ── Favorites — always dynamic, user-specific ──
    if (filter === "favorites") {
      const session = await getServerSession(authOptions)

      if (!session?.user?.email) {
        return Response.json(
          { success: false, message: "Not authenticated" },
          { status: 401 }
        )
      }

      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
      })

      if (!user) {
        return Response.json(
          { success: false, message: "User not found" },
          { status: 404 }
        )
      }

      const favorites = await prisma.favorite.findMany({
        where: { userId: user.id, type: "LEAGUE" },
      })

      const favIds = new Set(favorites.map(f => Number(f.itemId)))

      // Pull from Redis cached top_leagues + all continents to find matches
      // Use search index since it covers everything
      const { getSearchIndex } = await import("@/services/leaguesCache")
      const index = await getSearchIndex()
      const favLeagues = index.filter(l => favIds.has(l.id))

      return Response.json({ success: true, data: favLeagues })
    }

    // ── All leagues — paginated ──
    if (filter === "all_leagues") {
      const result = await getPaginatedLeagues(page)
      return Response.json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
      })
    }

    // ── Everything else — continent/top filters ──
    const leagues = await getFilteredLeagues(filter)
    return Response.json({ success: true, data: leagues })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}