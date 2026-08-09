import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

async function getGeoFromIp(ip) {
  if (!ip || ip === "::1" || ip === "127.0.0.1") {
    return { country: "NG", timezone: "Africa/Lagos", location: "Localhost" }
  }
  try {
    const res = await fetch(
      `http://ip-api.com/json/${ip}?fields=status,country,countryCode,timezone,city`
    )
    const data = await res.json()
    if (data.status === "success") {
      return {
        country: data.countryCode,     // "NG"
        timezone: data.timezone,       // "Africa/Lagos"
        location: `${data.city}, ${data.country}`,
      }
    }
  } catch {
    // silently fail
  }
  return { country: null, timezone: null, location: null }
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

    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null
    const userAgent = req.headers.get("user-agent") || null

    // Get geo data from IP
    const geo = await getGeoFromIp(ipAddress)

    // Find user to check if we need to backfill country/timezone
    const existingUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { country: true, timezone: true },
    })

    // Seed welcome notification if user has none
    const notifCount = await prisma.notification.count({
      where: { userId: session.user.id },
    })
    if (notifCount === 0) {
      await prisma.notification.create({
        data: {
          userId: session.user.id,
          title: "Welcome to GOALIQ",
          message: "Thanks for joining! Explore live scores, build your dream XI, and get AI-powered insights.",
          type: "welcome",
        },
      })
    }

    // Backfill country and timezone if missing
    const userUpdates = {}
    if (!existingUser?.country && geo.country) userUpdates.country = geo.country
    if (!existingUser?.timezone && geo.timezone) userUpdates.timezone = geo.timezone

    if (Object.keys(userUpdates).length > 0) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: userUpdates,
      })
    }

    // Handle login activity
    const latestActivity = await prisma.loginActivity.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    if (!latestActivity) {
      await prisma.loginActivity.create({
        data: {
          userId: session.user.id,
          ipAddress,
          userAgent,
          device: parseDevice(userAgent),
          location: geo.location,
        },
      })
    } else if (!latestActivity.ipAddress) {
      await prisma.loginActivity.update({
        where: { id: latestActivity.id },
        data: {
          ipAddress,
          userAgent,
          device: parseDevice(userAgent),
          location: geo.location,
        },
      })
    }

    // Return full user profile
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
      "matchReminders", "goalAlerts", "redCardAlerts",
      "halfTimeScores", "fullTimeScores", "newsAlerts",
      "transferAlerts", "pushEnabled", "emailEnabled",
      "quietHoursEnabled",
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