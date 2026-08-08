import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function getLocationFromIp(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1") return "Localhost"
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,country`)
    const data = await res.json()
    if (data.status === "success") {
      return `${data.city}, ${data.country}`
    }
  } catch {
    // silently fail
  }
  return null
}

function parseDevice(ua) {
  if (!ua) return null
  if (/Mobile|Android|iPhone|iPad|iPod/.test(ua)) return "Mobile"
  if (/Tablet|iPad/.test(ua)) return "Tablet"
  return "Desktop"
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip")
      || null
    const userAgent = req.headers.get("user-agent") || null

    // Find the most recent activity row for this user
    const latestActivity = await prisma.loginActivity.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    if (!latestActivity) {
      // First time — create with full data
      const location = await getLocationFromIp(ipAddress)
      await prisma.loginActivity.create({
        data: {
          userId: session.user.id,
          ipAddress,
          userAgent,
          device: parseDevice(userAgent),
          location,
        },
      })
    } else if (!latestActivity.ipAddress) {
      // Old null row exists — backfill it
      const location = await getLocationFromIp(ipAddress)
      await prisma.loginActivity.update({
        where: { id: latestActivity.id },
        data: {
          ipAddress,
          userAgent,
          device: parseDevice(userAgent),
          location,
        },
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
        country: true,
        language: true,
        timezone: true,
        defaultMatchView: true,
        dataSaver: true,
        autoPlayVideos: true,
        showPlayerRatings: true,
        theme: true,
        lastLoginAt: true,
      },
    })

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 })
    }

    return Response.json({ success: true, user })
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

    const body = await req.json()

    const allowedFields = [
      "name",
      "country",
      "language",
      "timezone",
      "defaultMatchView",
      "dataSaver",
      "autoPlayVideos",
      "showPlayerRatings",
      "theme",
    ]

    const updateData = {}

    for (const key of allowedFields) {
      if (body[key] !== undefined) {
        updateData[key] = body[key]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { message: "No valid fields to update" },
        { status: 400 }
      )
    }

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        country: true,
        language: true,
        timezone: true,
        defaultMatchView: true,
        dataSaver: true,
        autoPlayVideos: true,
        showPlayerRatings: true,
        theme: true,
      },
    })

    return Response.json({ success: true, user: updated })
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 })
  }
}