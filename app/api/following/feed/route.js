import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

const FEED_CACHE_SECONDS = 60 * 60 // 1 hour

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

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
    })

    if (!favorites.length) {
      return Response.json({ success: true, data: [] })
    }

    const cacheKey = `following:feed:${user.id}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return Response.json({ success: true, data: cached })
    }

    // Fetch news for each followed entity in parallel
    const newsPromises = favorites.map(async (fav) => {
      const res = await fetch(
        `https://gnews.io/api/v4/search?q=${encodeURIComponent(fav.name)}&lang=en&max=2&apikey=${process.env.GNEWS_API_KEY}`
      )
      const data = await res.json()

      return (data.articles ?? []).map(article => ({
        id: `${fav.itemId}-${article.url}`,
        source: { name: fav.name, logo: fav.logo, type: fav.type },
        type: "news",
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
      }))
    })

    const results = await Promise.all(newsPromises)
    const feed = results.flat()

    // Sort by most recent
    feed.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    await redis.set(cacheKey, feed, { ex: FEED_CACHE_SECONDS })

    return Response.json({ success: true, data: feed })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}