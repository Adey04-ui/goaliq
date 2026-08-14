import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import {
  getFavoritesCache,
  setFavoritesCache,
} from "@/services/favoritesCache"

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const body = await req.json()
    let { itemId, type, name, logo } = body

    // Prisma expects itemId as Int, frontend sends String
    const numericItemId = parseInt(itemId, 10)
    if (isNaN(numericItemId)) {
      return Response.json({ message: "Invalid itemId" }, { status: 400 })
    }

    type = type.toUpperCase()

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 })
    }

    const existing = await prisma.favorite.findFirst({
      where: {
        AND: [
          { userId: user.id },
          { type },
          { itemId: numericItemId },
        ],
      },
    })

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } })

      const updated = await prisma.favorite.findMany({
        where: { userId: user.id },
      })

      const formatted = {
        league: updated.filter((f) => f.type === "LEAGUE"),
        team: updated.filter((f) => f.type === "TEAM"),
        match: updated.filter((f) => f.type === "MATCH"),
      }

      await setFavoritesCache(user.id, formatted)

      return Response.json({ success: true, removed: true })
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: user.id,
        itemId: numericItemId,
        type,
        name,
        logo,
      },
    })

    const updated = await prisma.favorite.findMany({
      where: { userId: user.id },
    })

    const formatted = {
      league: updated.filter((f) => f.type === "LEAGUE"),
      team: updated.filter((f) => f.type === "TEAM"),
      match: updated.filter((f) => f.type === "MATCH"),
    }

    await setFavoritesCache(user.id, formatted)

    return Response.json({ success: true, favorite })
  } catch (error) {
    console.error("FAVOURITES POST ERROR:", error)
    return Response.json(
      { message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return Response.json({ message: "Not authenticated" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    })

    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 })
    }

    const cached = await getFavoritesCache(user.id)

    if (cached) {
      return Response.json({
        success: true,
        favorites: cached,
        source: "cache",
      })
    }

    const where = { userId: user.id }
    if (type) where.type = type.toUpperCase()

    const favorites = await prisma.favorite.findMany({
      where,
      orderBy: { createdAt: "desc" },
    })

    const formatted = {
      league: favorites.filter((f) => f.type === "LEAGUE"),
      team: favorites.filter((f) => f.type === "TEAM"),
      match: favorites.filter((f) => f.type === "MATCH"),
    }

    await setFavoritesCache(user.id, formatted)

    return Response.json({
      success: true,
      favorites: formatted,
      source: "database",
    })
  } catch (error) {
    console.error("FAVOURITES GET ERROR:", error)
    return Response.json({ message: error.message }, { status: 500 })
  }
}