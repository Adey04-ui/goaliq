"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, CheckCheck, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"

export default function NotificationBell() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const panelRef = useRef(null)

  async function loadNotifications() {
    setLoading(true)
    try {
      const res = await fetch("/api/user/notifications?limit=20")
      const data = await res.json()
      if (data.success) {
        setNotifications(data.notifications)
        setUnreadCount(data.unreadCount)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNotifications()
    // Poll every 30 seconds
    const interval = setInterval(loadNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  async function markAsRead(id) {
    await fetch(`/api/user/notifications?id=${id}`, { method: "PATCH" })
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    )
    setUnreadCount((c) => Math.max(0, c - 1))
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
    return new Date(date).toLocaleDateString()
  }

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "relative",
          background: "transparent",
          border: "none",
          color: "#fff",
          cursor: "pointer",
          padding: 8,
        }}
      >
        <Bell size={20} />
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              style={{
                position: "absolute",
                top: 2,
                right: 2,
                background: "#ef4444",
                color: "#fff",
                fontSize: 10,
                fontWeight: 700,
                width: 18,
                height: 18,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid #0a0a0a",
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ duration: 0.15 }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 360,
              maxHeight: 480,
              background: "#0c1117",
              borderRadius: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              zIndex: 100,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid #222",
              }}
            >
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Notifications</h3>
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
                    gap: 4,
                  }}
                >
                  <CheckCheck size={14} />
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div style={{ overflowY: "auto", flex: 1 }}>
              {loading && notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>
                  Loading...
                </div>
              ) : notifications.length === 0 ? (
                <div style={{ padding: 40, textAlign: "center", color: "#888", fontSize: 14 }}>
                  No notifications yet
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.read && markAsRead(n.id)}
                    style={{
                      padding: "14px 20px",
                      borderBottom: "1px solid #1a1a1a",
                      cursor: "pointer",
                      background: n.read ? "transparent" : "rgba(59,130,246,0.06)",
                      display: "flex",
                      gap: 12,
                      alignItems: "flex-start",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => {
                      if (n.read) e.currentTarget.style.background = "rgba(255,255,255,0.02)"
                    }}
                    onMouseLeave={(e) => {
                      if (n.read) e.currentTarget.style.background = "transparent"
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          fontSize: 14,
                          fontWeight: n.read ? 400 : 600,
                          color: "#fff",
                          marginBottom: 4,
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        {!n.read && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: "#3b82f6",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        {n.title}
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          color: "#888",
                          lineHeight: 1.4,
                          marginBottom: 6,
                        }}
                      >
                        {n.message}
                      </div>
                      <div style={{ fontSize: 12, color: "#555" }}>{timeAgo(n.createdAt)}</div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteNotif(n.id)
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#555",
                        cursor: "pointer",
                        padding: 4,
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div
              style={{
                padding: "12px 20px",
                borderTop: "1px solid #222",
                textAlign: "center",
              }}
            >
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                style={{ color: "#888", fontSize: 13, textDecoration: "none" }}
              >
                View all notifications
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}