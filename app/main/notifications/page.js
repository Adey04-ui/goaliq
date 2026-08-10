"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/context/userContext"
import { useFormatDateTime } from "@/lib/preferences"
import {
  Bell,
  CheckCheck,
  Trash2,
  ArrowLeft,
  Settings,
  Inbox,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

function SkeletonPulse({ width, height, radius = 6 }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "linear-gradient(90deg, #1a1a1a 25%, #2a2a2a 50%, #1a1a1a 75%)",
        backgroundSize: "200% 100%",
        animation: "notifSkeletonShimmer 1.4s ease-in-out infinite",
      }}
    />
  )
}

function NotificationsSkeleton() {
  return (
    <div className="notificationsPage">
      <style>{`
        @keyframes notifSkeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>

      <div className="notificationsPage__header">
        <SkeletonPulse width={180} height={24} style={{ marginBottom: 6 }} />
        <SkeletonPulse width={260} height={14} />
      </div>

      <div className="notificationsPage__toolbar">
        <SkeletonPulse width={100} height={32} radius={8} />
        <SkeletonPulse width={80} height={32} radius={8} />
      </div>

      <div className="notificationsPage__list">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="notificationsPage__item" style={{ opacity: 0.5 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", flex: 1 }}>
              <SkeletonPulse width={8} height={8} radius="50%" style={{ marginTop: 6 }} />
              <div style={{ flex: 1 }}>
                <SkeletonPulse width="60%" height={14} style={{ marginBottom: 8 }} />
                <SkeletonPulse width="90%" height={12} style={{ marginBottom: 6 }} />
                <SkeletonPulse width={80} height={10} />
              </div>
            </div>
            <SkeletonPulse width={32} height={32} radius={8} />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NotificationsPage() {
  const router = useRouter()
  const { status } = useUser()
  const formatDateTime = useFormatDateTime()

  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all") // "all" | "unread"

  const loadNotifications = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/user/notifications?limit=100")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (e) {
      console.error("Failed to load notifications:", e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") loadNotifications()
  }, [status, loadNotifications])

  async function markAsRead(id) {
    await fetch(`/api/user/notifications?id=${id}`, { method: "PATCH" })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
  }

  async function markAsUnread(id) {
    await fetch(`/api/user/notifications?id=${id}&read=false`, { method: "PATCH" })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: false } : n))
    )
    setUnreadCount((c) => c + 1)
  }

  async function markAllRead() {
    await fetch("/api/user/notifications", { method: "PATCH" })
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  async function deleteNotif(id) {
    await fetch(`/api/user/notifications?id=${id}`, { method: "DELETE" })
    const wasUnread = notifications.find((n) => n.id === id)?.read === false
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    if (wasUnread) setUnreadCount((c) => Math.max(0, c - 1))
  }

  function timeAgo(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000)
    if (seconds < 60) return "Just now"
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    if (days < 7) return `${days}d ago`
    return formatDateTime(date, { month: "short", day: "numeric" })
  }

  const filtered = notifications.filter((n) => {
    if (filter === "unread") return !n.read
    return true
  })

  if (status === "loading" || loading) {
    return <NotificationsSkeleton />
  }

  return (
    <div className="parent-container">
      <div className="notificationsPage" style={{ display: "flex", flexDirection: "column", gap: 20, padding: "20px 0" }}>
        {/* Header */}
        <div className="notificationsPage__header">
          <button
            onClick={() => router.back()}
            style={{
              background: "transparent",
              border: "none",
              color: "#888",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 14,
              marginBottom: 12,
              padding: 0,
            }}
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 4px", color: "#fff" }}>
                Notifications
              </h1>
              <p style={{ margin: 0, color: "#888", fontSize: 14 }}>
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
                  : "You're all caught up"}
              </p>
            </div>
            <button
              onClick={() => router.push("/main/settings")}
              style={{
                background: "transparent",
                border: "1px solid #333",
                color: "#888",
                borderRadius: 10,
                padding: "8px 12px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
              }}
            >
              <Settings size={14} />
              Preferences
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="notificationsPage__toolbar" style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          <div style={{ display: "flex", gap: 8 }}>
            {["all", "unread"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  background: filter === f ? "#1a1a1a" : "transparent",
                  border: "1px solid",
                  borderColor: filter === f ? "#444" : "#222",
                  color: filter === f ? "#fff" : "#888",
                  borderRadius: 8,
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  textTransform: "capitalize",
                }}
              >
                {f}
                {f === "unread" && unreadCount > 0 && (
                  <span style={{ marginLeft: 6, color: "#3b82f6" }}>{unreadCount}</span>
                )}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: "transparent",
                border: "none",
                color: "#3b82f6",
                fontSize: 13,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 500,
              }}
            >
              <CheckCheck size={14} />
              Mark all as read
            </button>
          )}
        </div>

        {/* List */}
        <div className="notificationsPage__list">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  textAlign: "center",
                  padding: "60px 20px",
                  color: "#555",
                }}
              >
                <Inbox size={40} style={{ marginBottom: 16, opacity: 0.3 }} />
                <p style={{ fontSize: 14 }}>
                  {filter === "unread"
                    ? "No unread notifications"
                    : "No notifications yet"}
                </p>
              </motion.div>
            ) : (
              filtered.map((n) => (
                <motion.div
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="notificationsPage__item"
                  style={{
                    padding: "16px 20px",
                    borderBottom: "1px solid #1a1a1a",
                    display: "flex",
                    gap: 12,
                    alignItems: "flex-start",
                    background: n.read ? "transparent" : "rgba(59,130,246,0.04)",
                    cursor: "pointer",
                  }}
                  onClick={() => !n.read && markAsRead(n.id)}
                >
                  {/* Unread dot */}
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: n.read ? "transparent" : "#3b82f6",
                      marginTop: 6,
                      flexShrink: 0,
                    }}
                  />

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: n.read ? 400 : 600,
                        color: "#fff",
                        marginBottom: 4,
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#888",
                        lineHeight: 1.5,
                        marginBottom: 6,
                      }}
                    >
                      {n.message}
                    </div>
                    <div style={{ fontSize: 12, color: "#555" }}>
                      {timeAgo(n.createdAt)}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                    {n.read ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsUnread(n.id)
                        }}
                        title="Mark as unread"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#555",
                          cursor: "pointer",
                          padding: 6,
                          borderRadius: 6,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Bell size={14} />
                      </button>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          markAsRead(n.id)
                        }}
                        title="Mark as read"
                        style={{
                          background: "transparent",
                          border: "none",
                          color: "#3b82f6",
                          cursor: "pointer",
                          padding: 6,
                          borderRadius: 6,
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(59,130,246,0.1)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <CheckCheck size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotif(n.id)
                      }}
                      title="Delete"
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#555",
                        cursor: "pointer",
                        padding: 6,
                        borderRadius: 6,
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#1a1a1a")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}