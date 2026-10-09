import { redis } from "@/lib/redis"
import { withRateLimit } from "@/lib/withRateLimit"

const NEWS_CACHE_SECONDS = 60 * 60 * 2 // 2 hours

const NEWS_TOPICS = {
  all: {
    query:
      '("soccer" OR "association football" OR "Premier League" OR "La Liga" OR "Serie A" OR "Bundesliga" OR "Ligue 1" OR "Champions League" OR UEFA)',
  },

  latest: {
    query:
      '("soccer" OR "Premier League" OR "La Liga" OR "Serie A" OR "Bundesliga" OR "Ligue 1" OR "Champions League")',
  },

  "champions-league": {
    query: '"UEFA Champions League" football',
  },

  "premier-league": {
    query: '"Premier League" football',
  },

  transfers: {
    query: '("football transfer" OR "soccer transfer" OR "transfer news")',
  },

  "la-liga": {
    query: '"La Liga" football',
  },
}

const EXCLUDED_TERMS = [
  "nfl",
  "american football",
  "super bowl",
  "touchdown",
  "quarterback",
  "wide receiver",
  "running back",
  "nba",
  "basketball",
  "cricket",
  "wicket",
  "ipl",
  "test match",
  "t20",
  "baseball",
  "mlb",
  "nhl",
  "ice hockey",
]

const FOOTBALL_TERMS = [
  "soccer",
  "football",
  "premier league",
  "champions league",
  "europa league",
  "conference league",
  "la liga",
  "serie a",
  "bundesliga",
  "ligue 1",
  "uefa",
  "fifa",
  "fa cup",
  "copa del rey",
  "transfer",
  "goal",
  "striker",
  "midfielder",
  "defender",
  "goalkeeper",
  "manager",
  "coach",
]

function isRelevantFootballArticle(article) {
  const text = [
    article.title,
    article.description,
    article.content,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()

  const hasExcludedTerm = EXCLUDED_TERMS.some((term) =>
    text.includes(term)
  )

  if (hasExcludedTerm) {
    return false
  }

  return FOOTBALL_TERMS.some((term) => text.includes(term))
}

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url)

    const topic = searchParams.get("q") || "all"
    const max = Math.min(
      Math.max(Number(searchParams.get("max")) || 10, 1),
      10
    )

    const topicConfig = NEWS_TOPICS[topic]

    if (!topicConfig) {
      return Response.json(
        {
          success: false,
          message: "Invalid news topic",
        },
        { status: 400 }
      )
    }

    const cacheKey = `news:${topic}:${max}`

    const cached = await redis.get(cacheKey)

    if (cached) {
      console.log(`[news] Redis hit — ${cacheKey}`)

      return Response.json({
        success: true,
        data: cached,
      })
    }

    console.log(
      `[news] Redis miss — fetching topic "${topic}"`
    )

    const url =
      `https://gnews.io/api/v4/search?` +
      `q=${encodeURIComponent(topicConfig.query)}` +
      `&lang=en` +
      `&max=${max}` +
      `&apikey=${process.env.GNEWS_API_KEY}`

    const res = await fetch(url)

    if (!res.ok) {
      return Response.json(
        {
          success: false,
          message: "Failed to fetch news",
        },
        { status: 502 }
      )
    }

    const data = await res.json()

    const articles = Array.isArray(data.articles)
      ? data.articles
      : []

    const filteredArticles = articles.filter(
      isRelevantFootballArticle
    )

    await redis.set(
      cacheKey,
      filteredArticles,
      {
        ex: NEWS_CACHE_SECONDS,
      }
    )

    return Response.json({
      success: true,
      data: filteredArticles,
    })
  } catch (error) {
    console.error("[news] Error:", error)

    return Response.json(
      {
        success: false,
        message: error.message || "Failed to fetch news",
      },
      { status: 500 }
    )
  }
}

export const GET = withRateLimit(getHandler, {
  limiter: "read",
})