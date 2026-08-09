import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: "desc" },
        take: Math.min(limit, 50),
      }),
      prisma.notification.count({
        where: { userId: session.user.id, read: false },
      }),
    ])

    return Response.json({ success: true, notifications, unreadCount })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export async function PATCH(req) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (id) {
      // Mark single as read
      await prisma.notification.updateMany({
        where: { id, userId: session.user.id },
        data: { read: true },
      })
    } else {
      // Mark all as read
      await prisma.notification.updateMany({
        where: { userId: session.user.id, read: false },
        data: { read: true },
      })
    }

    return Response.json({ success: true })
  } catch (error) {
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
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ message: "id required" }, { status: 400 })
    }

    await prisma.notification.deleteMany({
      where: { id, userId: session.user.id },
    })

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}