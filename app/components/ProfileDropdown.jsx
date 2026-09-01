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
  Sun,
  HelpCircle,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser } from "@/context/userContext"
import { useTheme } from "@/context/themeContext"

export default function ProfileDropdown({ user }) {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const router = useRouter()
  const { theme, setTheme } = useTheme()

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
    setOpen(false)
  }

  async function handleThemeToggle() {
    const nextTheme = theme === "dark" ? "light" : "dark"
    setTheme(nextTheme)
    setOpen(false)
  }

  const menuItems = [
    { icon: <User size={16} />, label: "My Profile", href: "/main/settings" },
    { icon: <Heart size={16} />, label: "Following", href: "/main/following" },
    { icon: <Settings size={16} />, label: "Settings", href: "/main/settings" },
    { divider: true },
    {
      icon: <Crown size={16} />,
      label: "Upgrade to Pro",
      href: "#",
      highlight: true,
      onClick: () => alert("Pro upgrade coming soon!"),
    },
    {
      icon: theme === "dark" ? <Sun size={16} /> : <Moon size={16} />,
      label: theme === "dark" ? "Light Mode" : "Dark Mode",
      onClick: handleThemeToggle,
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
    <div className="profileDropdown" ref={panelRef}>
      <button className="profileDropdown__trigger" onClick={() => setOpen(!open)}>
        <Image
          src={user?.image || "/default-avatar.png"}
          alt={user?.name || "Profile"}
          width={36}
          height={36}
          className={`profileDropdown__avatar ${user?.isPremium ? "profileDropdown__avatar--premium" : ""}`}
        />
        {user?.isPremium && (
          <span className="profileDropdown__badge">
            <Crown size={9} />
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
            className="profileDropdown__panel"
          >
            <div className="profileDropdown__header">
              <Image
                src={user?.image || "/default-avatar.png"}
                alt={user?.name || "Profile"}
                width={44}
                height={44}
                className="profileDropdown__headerAvatar"
              />
              <div className="profileDropdown__headerInfo">
                <div className="profileDropdown__headerName">{user?.name || "User"}</div>
                <div className="profileDropdown__headerEmail">{user?.email || ""}</div>
                {user?.isPremium && (
                  <span className="profileDropdown__headerBadge">
                    <Crown size={10} /> PRO
                  </span>
                )}
              </div>
            </div>

            <div className="profileDropdown__menu">
              {menuItems.map((item, i) =>
                item.divider ? (
                  <div key={i} className="profileDropdown__divider" />
                ) : (
                  <MenuItem key={i} item={item} onClose={() => setOpen(false)} />
                )
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function MenuItem({ item, onClose }) {
  const handleClick = () => {
    if (item.onClick) item.onClick()
    onClose()
  }

  const className = [
    "profileDropdown__item",
    item.danger ? "profileDropdown__item--danger" : "",
    item.highlight ? "profileDropdown__item--highlight" : "",
  ].filter(Boolean).join(" ")

  const content = (
    <>
      <span className="profileDropdown__itemIcon">{item.icon}</span>
      <span className="profileDropdown__itemLabel">{item.label}</span>
      {item.href && !item.onClick && <ChevronRight size={14} className="profileDropdown__itemChevron" />}
    </>
  )

  if (item.href && !item.onClick) {
    return (
      <Link href={item.href} className={className} onClick={onClose}>
        {content}
      </Link>
    )
  }

  return (
    <button className={className} onClick={handleClick}>
      {content}
    </button>
  )
}