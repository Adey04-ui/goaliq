import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { cookies } from "next/headers"
import { withRateLimit } from "@/lib/withRateLimit"

async function getCurrentSessionToken() {
  // cookies() is async in Next.js 15+ - same issue as headers() in route.js
  const cookieStore = await cookies()
  return (
    cookieStore.get("__Secure-next-auth.session-token")?.value ||
    cookieStore.get("next-auth.session-token")?.value ||
    null
  )
}

async function getHandler(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const currentSessionToken = await getCurrentSessionToken()

    const activities = await prisma.loginActivity.findMany({
      where: { userId: session.user.id, deleted: false },
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
    })

    const withCurrentFlag = activities.map((a) => ({
      ...a,
      isCurrent: !!currentSessionToken && a.sessionToken === currentSessionToken,
    }))

    return Response.json({ success: true, activities: withCurrentFlag })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })

async function deleteHandler(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return Response.json({ message: "Missing activity id" }, { status: 400 })
    }

    const activity = await prisma.loginActivity.findUnique({ where: { id } })

    if (!activity || activity.userId !== session.user.id) {
      return Response.json({ message: "Not found" }, { status: 404 })
    }

    await prisma.$transaction([
      ...(activity.sessionToken
        ? [prisma.session.deleteMany({ where: { sessionToken: activity.sessionToken } })]
        : []),
      prisma.loginActivity.update({
        where: { id },
        data: { deleted: true },
      }),
    ])

    return Response.json({ success: true })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}

export const DELETE = withRateLimit(deleteHandler, { limiter: "write" })