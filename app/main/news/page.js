"use client"

import useSWR from "swr"
import { Suspense, useState } from "react"
import { useSearchParams } from "next/navigation"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

const TOPICS = [
  { label: "All News", query: "football" },
  { label: "Latest News", query: "football latest" },
  { label: "Champions League", query: "Champions League" },
  { label: "Premier League", query: "Premier League" },
  { label: "Transfers", query: "football transfer" },
  { label: "La Liga", query: "La Liga" },
]

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}

function NewsSkeleton() {
  return (
    <>
      {/* Pills */}
      <div className="newsPage__skeletonPills">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="newsPage__skeletonPill" />
        ))}
      </div>

      {/* Top grid */}
      <div className="newsPage__skeleton-grid">
        <div className="newsPage__skeleton newsPage__skeleton--hero" />
        <div className="newsPage__skeletonMidCol">
          <div className="newsPage__skeleton newsPage__skeleton--featured" />
        </div>
        <div className="newsPage__skeletonSideCol">
          <div className="newsPage__skeleton newsPage__skeleton--side" />
          <div className="newsPage__skeleton newsPage__skeleton--side" />
        </div>
      </div>

      {/* Mid grid */}
      <div className="newsPage__skeletonMidGrid">
        <div className="newsPage__skeleton newsPage__skeleton--mid" />
        <div className="newsPage__skeleton newsPage__skeleton--mid" />
        <div className="newsPage__skeleton newsPage__skeleton--mid" />
      </div>

      {/* Bottom grid */}
      <div className="newsPage__skeletonBottomGrid">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="newsPage__skeleton newsPage__skeleton--small" />
        ))}
      </div>
    </>
  )
}

function NewsPageContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get("q") || "football"
  const [query, setQuery] = useState(initialQuery)

  const { data, isLoading } = useSWR(
    `/api/news?q=${encodeURIComponent(query)}&max=10`,
    fetcher,
    {
      dedupingInterval: 1000 * 60 * 60 * 2,
      revalidateOnFocus: false,
    }
  )

  const articles = data?.data || []

  const hero = articles[0]
  const featured = articles.slice(1, 2)
  const side = articles.slice(2, 4)
  const medium = articles.slice(4, 6)
  const small = articles.slice(6, 10)

  return (
    <>
      <h1 className="newsPage__heading">News</h1>

      <div className="newsPage__topics">
        {TOPICS.map((topic) => (
          <button
            key={topic.query}
            className={`newsPage__topic ${query === topic.query ? "active" : ""}`}
            onClick={() => setQuery(topic.query)}
          >
            {topic.label}
          </button>
        ))}
      </div>

      {isLoading ? <NewsSkeleton /> : (
        <>
          <div className="newsPage__topGrid">
            {hero && (
              <a
                href={hero.url}
                target="_blank"
                rel="noopener noreferrer"
                className="newsPage__hero"
                style={{ backgroundImage: `url(${hero.image})` }}
              >
                <div className="newsPage__hero__overlay">
                  <span className="newsPage__tag">
                    <span>
                      {hero.source.name}
                    </span>
                  </span>
                  <h2 className="newsPage__hero__title">{hero.title}</h2>
                  <p className="newsPage__hero__desc">{hero.description}</p>
                  <div className="newsPage__meta">
                    <span>{timeAgo(hero.publishedAt)}</span>
                  </div>
                </div>
              </a>
            )}

            <div className="newsPage__middleCol">
              {featured.map((article) => (
                <a
                  key={article.url}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="newsPage__featured"
                  style={{ backgroundImage: `url(${article.image})` }}
                >
                  <div className="newsPage__featured__overlay">
                    <span className="newsPage__tag">{article.source.name}</span>
                    <h3 className="newsPage__featured__title">{article.title}</h3>
                    <p className="newsPage__featured__desc">{article.description}</p>
                    <div className="newsPage__meta">
                      <span>{timeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>

            <div className="newsPage__sideCol">
              {side.map((article) => (
                <a
                  key={article.url}
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="newsPage__sideCard"
                >
                  {article.image && (
                    <div className="newsPage__sideCard__image">
                      <img src={article.image} alt={article.title} />
                    </div>
                  )}
                  <div className="newsPage__sideCard__content">
                    <span className="newsPage__tag">{article.source.name}</span>
                    <p className="newsPage__sideCard__title">{article.title.slice(0, 70) + "..."}</p>
                    <div className="newsPage__meta">
                      <span>{timeAgo(article.publishedAt)}</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="newsPage__midGrid">
            {articles[5] && (
              <a
                href={articles[5].url}
                target="_blank"
                rel="noopener noreferrer"
                className="newsPage__landscape"
              >
                {articles[5].image && (
                  <div className="newsPage__landscape__image">
                    <img src={articles[5].image} alt={articles[5].title} />
                  </div>
                )}
                <div className="newsPage__landscape__content">
                  <span className="newsPage__tag">{articles[5].source.name}</span>
                  <h3 className="newsPage__landscape__title">{articles[5].title}</h3>
                  <p className="newsPage__landscape__desc">{articles[5].description}</p>
                  <div className="newsPage__meta">
                    <span>{timeAgo(articles[5].publishedAt)}</span>
                  </div>
                </div>
              </a>
            )}

            {medium.map((article) => (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="newsPage__medCard"
                style={{ backgroundImage: `url(${article.image})` }}
              >
                <div className="newsPage__medCard__overlay">
                  <span className="newsPage__tag">{article.source.name}</span>
                  <p className="newsPage__medCard__title">{article.title}</p>
                  <div className="newsPage__meta">
                    <span>{timeAgo(article.publishedAt)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>

          <div className="newsPage__bottomGrid">
            {small.map((article) => (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="newsPage__smallCard"
                style={{ backgroundImage: `url(${article.image})` }}
              >
                <div className="newsPage__smallCard__overlay">
                  <span className="newsPage__tag">{article.source.name}</span>
                  <p className="newsPage__smallCard__title">{article.title}</p>
                  <div className="newsPage__meta">
                    <span>{timeAgo(article.publishedAt)}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </>
      )}
    </>
  )
}

export default function NewsPage() {
  return (
    <div className="parent-container">
      <div className="newsPage">
        <Suspense fallback={
          <div className="newsPage">
            <h1 className="newsPage__heading">News</h1>
            <NewsSkeleton />
          </div>
        }>
          <NewsPageContent />
        </Suspense>
      </div>
    </div>
  )
}