"use client"

import { useState } from "react"
import useSWR from "swr"
import Image from "next/image"
import { Plus, Newspaper, Calendar } from "lucide-react"

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days = Math.floor(hours / 24)
  if (days > 0) return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  return `${mins}m ago`
}

const TABS = ["All", "Teams", "Leagues", "Players"]

export default function FollowingPage() {
  const [activeTab, setActiveTab] = useState("All")

  const { data: followingData, isLoading: followingLoading } = useSWR(
    "/api/following",
    fetcher
  )

  const { data: feedData, isLoading: feedLoading } = useSWR(
    "/api/following/feed",
    fetcher
  )

  const teams = followingData?.data?.teams ?? []
  const leagues = followingData?.data?.leagues ?? []
  const players = followingData?.data?.players ?? []
  const all = followingData?.data?.all ?? []

  const feed = feedData?.data ?? []

  const filteredFeed = activeTab === "All"
    ? feed
    : feed.filter(item => item.source.type === activeTab.slice(0, -1).toUpperCase())

  return (
    <div className="parent-container">
      <div className="followingPage">
        <h1 className="followingPage__heading">Following</h1>

        {/* Tabs */}
        <div className="followingPage__tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`followingPage__tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Followed entities row */}
        <div className="followingPage__row">
          {followingLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="followingPage__avatarSkeleton" />
            ))
          ) : (
            <>
              {all.map(item => (
                <div key={item.itemId} className="followingPage__avatarItem">
                  <div className="followingPage__avatarCircle">
                    <Image
                      src={item.logo}
                      alt={item.name}
                      width={item.type === "PLAYER" ? 56 : 36}
                      height={item.type === "PLAYER" ? 56 : 36}
                      style={{
                        objectFit: item.type === "PLAYER" ? "cover" : "contain",
                        borderRadius: item.type === "PLAYER" ? "50%" : 0,
                      }}
                    />
                  </div>
                  <span className="followingPage__avatarLabel">{item.name}</span>
                </div>
              ))}

              <div className="followingPage__avatarItem">
                <div className="followingPage__avatarCircle followingPage__avatarCircle--add">
                  <Plus size={18} color="#555" />
                </div>
                <span className="followingPage__avatarLabel followingPage__avatarLabel--muted">
                  Add
                </span>
              </div>
            </>
          )}
        </div>

        {/* Feed */}
        <div className="followingPage__feedLabel">
          Latest from who you follow
        </div>

        <div className="followingPage__feed">
          {feedLoading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="followingPage__feedSkeleton" />
            ))
          ) : !filteredFeed.length ? (
            <div className="followingPage__empty">
              {all.length === 0
                ? "Follow teams, leagues or players to see updates here"
                : "No recent updates"}
            </div>
          ) : (
            filteredFeed.map(item => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="followingPage__feedRow"
              >
                <Image
                  src={item.source.logo}
                  alt={item.source.name}
                  width={32}
                  height={32}
                  style={{
                    objectFit: item.source.type === "PLAYER" ? "cover" : "contain",
                    borderRadius: item.source.type === "PLAYER" ? "50%" : 0,
                  }}
                />
                <div className="followingPage__feedContent">
                  <div className="followingPage__feedMeta">
                    <span className="followingPage__feedSource">
                      {item.source.name}
                    </span>
                    <span className="followingPage__feedTime">
                      {timeAgo(item.publishedAt)}
                    </span>
                  </div>
                  <p className="followingPage__feedTitle">{item.title}</p>
                </div>
                <Newspaper size={18} color="#555" />
              </a>
            ))
          )}
        </div>
      </div>
    </div>
  )
}