import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { withRateLimit } from "@/lib/withRateLimit"

const FEED_CACHE_SECONDS = 60 * 60 // 1 hour
const PARTIAL_CACHE_SECONDS = 60 * 5 // some GNews calls failed: retry soon
// Every followed item = one GNews request on a cache miss. Cap it so one user
// with 40 favorites can't burn the daily GNews allowance on their own.
const MAX_FOLLOWED_FOR_FEED = 6

async function fetchNewsFor(fav) {
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(fav.name)}&lang=en&max=2&apikey=${process.env.GNEWS_API_KEY}`
    )

    // Without this check a failed call looks like "no news" and gets cached.
    if (!res.ok) return { ok: false, items: [] }

    const data = await res.json()

    return {
      ok: true,
      items: (data.articles ?? []).map((article) => ({
        id: `${fav.itemId}-${article.url}`,
        source: { name: fav.name, logo: fav.logo, type: fav.type },
        type: "news",
        title: article.title,
        url: article.url,
        publishedAt: article.publishedAt,
      })),
    }
  } catch (err) {
    console.error("[following] GNews request failed:", err)
    return { ok: false, items: [] }
  }
}

async function getHandler() {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    if (!userId) {
      return Response.json(
        { success: false, message: "Not authenticated" },
        { status: 401 }
      )
    }

    // Cache first: a hit now costs zero database queries.
    const cacheKey = `following:feed:${userId}`
    const cached = await redis.get(cacheKey)
    if (cached) {
      return Response.json({ success: true, data: cached })
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: MAX_FOLLOWED_FOR_FEED,
    })

    if (!favorites.length) {
      return Response.json({ success: true, data: [] })
    }

    const results = await Promise.all(favorites.map(fetchNewsFor))
    const feed = results.flatMap((r) => r.items)

    // Sort by most recent
    feed.sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))

    const allOk = results.every((r) => r.ok)
    await redis.set(cacheKey, feed, {
      ex: allOk ? FEED_CACHE_SECONDS : PARTIAL_CACHE_SECONDS,
    })

    return Response.json({ success: true, data: feed })
  } catch (error) {
    console.error("[following] error:", error)
    return Response.json(
      { success: false, message: "Something went wrong" },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })