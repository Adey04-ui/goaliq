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

      const updatedFavorites = await prisma.favorite.findMany({
        where: {
          userId: user.id,
        },
      })

      const formatted = {
        league: updatedFavorites.filter((f) => f.type === "LEAGUE"),
        team: updatedFavorites.filter((f) => f.type === "TEAM"),
        match: updatedFavorites.filter((f) => f.type === "MATCH"),
      }

      await setFavoritesCache(user.id, formatted)

      return Response.json({
        success: true,
        removed: true,
      })
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

    const updatedFavorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
    })

    const formatted = {
      league: updatedFavorites.filter((f) => f.type === "LEAGUE"),
      team: updatedFavorites.filter((f) => f.type === "TEAM"),
      match: updatedFavorites.filter((f) => f.type === "MATCH"),
    }

    await setFavoritesCache(user.id, formatted)

    return Response.json({
      success: true,
      favorite,
    })
  } catch (error) {
    return Response.json(
      { message: error.message },
      { status: 500 }
    )
  }
}

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return Response.json(
        { message: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type");

    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return Response.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    const cached = await getFavoritesCache(user.id)

    if (cached) {
      return Response.json({
        success: true,
        favorites: cached,
        source: "cache",
      })
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

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
    return Response.json(
      { message: error.message },
      { status: 500 }
    );
  }
}