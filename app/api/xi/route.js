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
      include: { userXI: true },
    })

    if (!user?.userXI) {
      return Response.json({
        success: true,
        data: { formation: "4-3-3", players: Array(11).fill(null) },
      })
    }

    return Response.json({ success: true, data: user.userXI })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    const { formation, players } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return Response.json(
        { success: false, message: "User not found" },
        { status: 404 }
      )
    }

    const xi = await prisma.userXI.upsert({
      where: { userId: user.id },
      update: { formation, players },
      create: { userId: user.id, formation, players },
    })

    return Response.json({ success: true, data: xi })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}