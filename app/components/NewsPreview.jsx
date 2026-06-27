"use client"

import useSWR from "swr"
import Image from "next/image"
import { useRouter } from "next/navigation"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

function NewsPreview({ query = "football" }) {
  const router = useRouter()

  const { data, isLoading } = useSWR(
    `/api/news?q=${encodeURIComponent(query)}&max=3`,
    fetcher,
    {
      dedupingInterval: 1000 * 60 * 60 * 2, // match server cache
      revalidateOnFocus: false,
    }
  )

  const articles = data?.data || []

  return (
    <div className="newsPreview">
      <div className="newsPreview__header">
        <span className="newsPreview__title">Latest News</span>
        <button
          className="newsPreview__seeMore"
          onClick={() => router.push(`/news?q=${encodeURIComponent(query)}`)}
        >
          See more
        </button>
      </div>

      <div className="newsPreview__list">
        {isLoading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="newsPreview__skeleton" />
            ))
          : articles.map((article) => (
              <a
                key={article.url}
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="newsPreview__article"
              >
                {article.image && (
                  <div className="newsPreview__article__image">
                    <img
                      src={article.image}
                      alt={article.title}
                    />
                  </div>
                )}
                <div className="newsPreview__article__content">
                  <span className="newsPreview__article__source">
                    {article.source.name}
                  </span>
                  <p className="newsPreview__article__title">
                    {article.title}
                  </p>
                  <span className="newsPreview__article__time">
                    {new Date(article.publishedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </a>
            ))}
      </div>
    </div>
  )
}

export default NewsPreview