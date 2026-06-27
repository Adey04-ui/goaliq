import { redis } from "@/lib/redis"

const NEWS_CACHE_SECONDS = 60 * 60 * 2 // 2 hours — news goes stale fast

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || "football"
    const max = searchParams.get("max") || "10"

    const cacheKey = `news:${query}:${max}`
    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log(`[news] Redis hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached })
    }

    console.log(`[news] Redis miss — fetching "${query}"`)

    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${max}&apikey=${process.env.GNEWS_API_KEY}`
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch news" },
        { status: 502 }
      )
    }

    const data = await res.json()
    const articles = data.articles

    await redis.set(cacheKey, articles, { ex: NEWS_CACHE_SECONDS })

    return Response.json({ success: true, data: articles })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}