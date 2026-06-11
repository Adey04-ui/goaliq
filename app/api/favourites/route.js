import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

export async function POST(req) {
  try {
    const session = await getServerSession()

    if (!session?.user?.email) {
      return Response.json(
        { message: "Not authenticated" },
        { status: 401 }
      )
    }

    const body = await req.json()

    const { itemId, type, name, logo } = body

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    })

    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      )
    }

    const existing = await prisma.favorite.findUnique({
      where: {
        userId_type_itemId: {
          userId: user.id,
          type,
          itemId,
        },
      },
    })

    if (existing) {
      await prisma.favorite.delete({
        where: {
          id: existing.id,
        },
      })

      return Response.json({ removed: true })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        itemId,
        type,
        name,
        logo,
      },
    })

    return Response.json(favorite)
  } catch (error) {
    return Response.json(
      { message: error.message },
      { status: 500 }
    )
  }
}