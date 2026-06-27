

const NEWS_CACHE_MS = 1000 * 60 * 60 * 2 // 2 hours

const newsCache = new Map()

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q") || "football"
    const max = searchParams.get("max") || "3"

    const cacheKey = `${query}_${max}`
    const now = Date.now()
    const cached = newsCache.get(cacheKey)

    if (cached && now < cached.expiry) {
      console.log(`[news] Cache hit — ${cacheKey}`)
      return Response.json({ success: true, data: cached.data })
    }

    console.log(`[news] Cache miss — fetching "${query}"`)

    const res = await fetch(
      `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=${max}&apikey=${process.env.GNEWS_API_KEY}`,
    )

    if (!res.ok) {
      return Response.json(
        { success: false, message: "Failed to fetch news" },
        { status: 502 }
      )
    }

    const data = await res.json()

    newsCache.set(cacheKey, {
      data: data.articles,
      expiry: now + NEWS_CACHE_MS,
    })

    return Response.json({ success: true, data: data.articles })

  } catch (error) {
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}