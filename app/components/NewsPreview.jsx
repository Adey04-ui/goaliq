"use client"

import useSWR from "swr"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/userContext"
import { useLocale, useUserTimezone } from "@/lib/preferences"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

function NewsPreview({ query = "football" }) {
  const router = useRouter()
  const { preferences } = useUser()
  const locale = useLocale()
  const timeZone = useUserTimezone()
  const dataSaver = preferences?.dataSaver ?? false

  const { data, isLoading } = useSWR(
    `/api/news?q=${encodeURIComponent(query)}&max=3`,
    fetcher,
    {
      dedupingInterval: 1000 * 60 * 60 * 2,
      revalidateOnFocus: false,
    }
  )

  const articles = data?.data || []

  const formatArticleDate = (dateString) => {
    const d = new Date(dateString)
    const opts = { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
    if (timeZone) opts.timeZone = timeZone
    return d.toLocaleDateString(locale, opts)
  }

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
                {article.image && !dataSaver && (
                  <div className="newsPreview__article__image">
                    <img src={article.image} alt={article.title} loading="lazy" />
                  </div>
                )}
                <div className="newsPreview__article__content">
                  <span className="newsPreview__article__source">{article.source.name}</span>
                  <p className="newsPreview__article__title">{article.title}</p>
                  <span className="newsPreview__article__time">
                    {formatArticleDate(article.publishedAt)}
                  </span>
                </div>
              </a>
            ))}
      </div>
    </div>
  )
}

export default NewsPreview