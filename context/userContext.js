"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

const UserContext = createContext()

export function UserProvider({ children }) {
  const { data: session, status } = useSession() || {}
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(true)

  useEffect(() => {
    if (status !== "authenticated") {
      setProfileLoading(false)
      return
    }

    let cancelled = false

    async function loadProfile() {
      setProfileLoading(true)
      try {
        const res = await fetch("/api/user/profile")
        const data = await res.json()
        if (!cancelled && data.success) {
          setProfile(data.user)
        }
      } catch (e) {
        console.error("Failed to load user profile:", e)
      } finally {
        if (!cancelled) setProfileLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, [status])

  // Convenience object — same field names you already use in Settings.jsx
  const preferences = profile
    ? {
      displayName: profile.name || "",
      email: profile.email || "",
      avatar: profile.image,
      country: profile.country || "",
      language: profile.language || "en",
      timezone: profile.timezone || "",
      defaultMatchView: profile.defaultMatchView || "live",
      dataSaver: profile.dataSaver || false,
      autoPlayVideos: profile.autoPlayVideos ?? true,
      showPlayerRatings: profile.showPlayerRatings ?? true,
      theme: profile.theme || "dark",
      matchReminders: profile.matchReminders ?? true,
      goalAlerts: profile.goalAlerts ?? true,
      redCardAlerts: profile.redCardAlerts ?? true,
      halfTimeScores: profile.halfTimeScores ?? false,
      fullTimeScores: profile.fullTimeScores ?? true,
      newsAlerts: profile.newsAlerts ?? true,
      transferAlerts: profile.transferAlerts ?? false,
      pushEnabled: profile.pushEnabled ?? true,
      emailEnabled: profile.emailEnabled ?? false,
      quietHoursEnabled: profile.quietHoursEnabled ?? false,
    }
    : null

  async function updatePreferences(updates) {
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
      const data = await res.json()
      if (data.success) {
        setProfile(data.user)
        return true
      }
      return false
    } catch (e) {
      console.error("Update preferences failed:", e)
      return false
    }
  }

  return (
    <UserContext.Provider
      value={{
        session,
        status,
        profile,         // raw API response if you need it
        preferences,     // clean mapped object
        profileLoading,  // true while fetching for the first time
        updatePreferences,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}