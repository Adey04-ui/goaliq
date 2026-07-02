import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"

export async function GET() {
  try {
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
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    })

    const teams = favorites.filter(f => f.type === "TEAM")
    const leagues = favorites.filter(f => f.type === "LEAGUE")
    const players = favorites.filter(f => f.type === "PLAYER")

    return Response.json({
      success: true,
      data: { teams, leagues, players, all: favorites },
    })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}