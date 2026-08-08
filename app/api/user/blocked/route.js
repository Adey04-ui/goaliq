import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const blocked = await prisma.blockedUser.findMany({
      where: { blockerId: session.user.id },
      include: {
        blocked: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return Response.json({ success: true, blocked })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    const { blockedId } = body

    if (!blockedId) {
      return Response.json(
        { message: "blockedId is required" },
        { status: 400 }
      )
    }

    if (blockedId === session.user.id) {
      return Response.json(
        { message: "Cannot block yourself" },
        { status: 400 }
      )
    }

    const blockedUser = await prisma.blockedUser.create({
      data: {
        blockerId: session.user.id,
        blockedId,
      },
    })

    return Response.json({ success: true, blockedUser })
  } catch (error) {
    // Handle unique constraint violation (already blocked)
    if (error.code === "P2002") {
      return Response.json(
        { message: "User already blocked" },
        { status: 409 }
      )
    }
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const blockedId = searchParams.get("id")

    if (!blockedId) {
      return Response.json(
        { message: "id query param is required" },
        { status: 400 }
      )
    }

    await prisma.blockedUser.deleteMany({
      where: {
        blockerId: session.user.id,
        blockedId,
      },
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}