"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  User,
  Heart,
  Settings,
  Crown,
  Moon,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export default function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open])

  async function handleLogout() {
    await signOut({ redirect: false })
    router.push("/")
    setOpen(false)
  }

  const menuItems = [
    {
      icon: <User size={16} />,
      label: "My Profile",
      href: "/main/settings",
    },
    {
      icon: <Heart size={16} />,
      label: "Following",
      href: "/main/following",
    },
    {
      icon: <Settings size={16} />,
      label: "Settings",
      href: "/main/settings",
    },
    { divider: true },
    {
      icon: <Crown size={16} />,
      label: "Upgrade to Pro",
      href: "#",
      highlight: true,
      onClick: () => alert("Pro upgrade coming soon!"),
    },
    {
      icon: <Moon size={16} />,
      label: "Dark Mode",
      toggle: true,
      onClick: () => alert("Theme toggle coming with your restyle!"),
    },
    { divider: true },
    {
      icon: <HelpCircle size={16} />,
      label: "Help & Support",
      onClick: () => window.location.href = "mailto:support@goaliq.com",
    },
    {
      icon: <LogOut size={16} />,
      label: "Logout",
      danger: true,
      onClick: handleLogout,
    },
  ]

  return (
    <div style={{ position: "relative" }} ref={panelRef}>
      {/* Profile trigger */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          background: "transparent",
          border: "none",
          cursor: "pointer",
          padding: 0,
          borderRadius: "50%",
          position: "relative",
        }}
      >
        <Image
          src={user?.image || "/default-avatar.png"}
          alt={user?.name || "Profile"}
          width={36}
          height={36}
          className="profile-picture"
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            border: user?.isPremium
              ? "2px solid #fbbf24"
              : "2px solid transparent",
          }}
        />
        {user?.isPremium && (
          <span
            style={{
              position: "absolute",
              bottom: -2,
              right: -2,
              background: "#fbbf24",
              borderRadius: "50%",
              width: 14,
              height: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Crown size={9} color="#0c1117" fill="#0c1117" />
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            style={{
              position: "absolute",
              top: "calc(100% + 10px)",
              right: 0,
              width: 280,
              background: "#0c1117",
              border: "1px solid #222",
              borderRadius: 16,
              boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
              zIndex: 100,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* User info header */}
            <div
              style={{
                padding: "16px 18px",
                borderBottom: "1px solid #1a1a1a",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <Image
                src={user?.image || "/default-avatar.png"}
                alt={user?.name || "Profile"}
                width={44}
                height={44}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#fff",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.name || "User"}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#888",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.email || ""}
                </div>
                {user?.isPremium && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#fbbf24",
                      marginTop: 4,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 3,
                    }}
                  >
                    <Crown size={10} /> PRO
                  </span>
                )}
              </div>
            </div>

            {/* Menu items */}
            <div style={{ padding: "6px 0" }}>
              {menuItems.map((item, i) =>
                item.divider ? (
                  <div
                    key={i}
                    style={{
                      height: 1,
                      background: "#1a1a1a",
                      margin: "6px 12px",
                    }}
                  />
                ) : (
                  <MenuItem key={i} item={item} />
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({ item }) {
  const baseStyle = {
    width: "100%",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 18px",
    background: "transparent",
    border: "none",
    color: item.danger ? "#ef4444" : item.highlight ? "#fbbf24" : "#e0e0e0",
    fontSize: 14,
    cursor: "pointer",
    textAlign: "left",
    textDecoration: "none",
    transition: "background 0.15s",
    borderRadius: 0,
  }

  const content = (
    <>
      <span style={{ display: "flex", alignItems: "center", opacity: 0.8 }}>
        {item.icon}
      </span>
      <span style={{ flex: 1 }}>{item.label}</span>
      {item.href && !item.onClick && (
        <ChevronRight size={14} color="#555" />
      )}
    </>
  )

  // If it has an href and NO custom onClick → use Link
  if (item.href && !item.onClick) {
    return (
      <Link
        href={item.href}
        style={baseStyle}
        onClick={() => setOpen(false)}
        onMouseEnter={(e) => { e.currentTarget.style.background = "#161d27" }}
        onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
      >
        {content}
      </Link>
    )
  }

  // Otherwise → button (handles onClick manually)
  return (
    <button
      onClick={item.onClick}
      style={baseStyle}
      onMouseEnter={(e) => { e.currentTarget.style.background = "#161d27" }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent" }}
    >
      {content}
    </button>
  )
}