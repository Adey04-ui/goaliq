"use client"

import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useUser } from "./userContext"

const ThemeContext = createContext({
  theme: "dark",
  setTheme: () => {},
  resolvedTheme: "dark",
  mounted: false,
})

export function ThemeProvider({ children }) {
  const { preferences, updatePreferences, status } = useUser()
  
  // 1. Instant read from localStorage (prevents flash)
  const [theme, setThemeState] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = window.localStorage.getItem("goaliq-theme")
      if (saved === "light" || saved === "dark") return saved
    }
    return "dark"
  })
  
  const [mounted, setMounted] = useState(false)

  // 2. Apply theme to document immediately
  useEffect(() => {
    const root = document.documentElement
    root.classList.remove("light", "dark")
    root.classList.add(theme)
    root.setAttribute("data-theme", theme)
    window.localStorage.setItem("goaliq-theme", theme)
  }, [theme])

  // 3. Sync DB preference → local state (on initial load / external changes)
  useEffect(() => {
    if (preferences?.theme && preferences.theme !== theme) {
      setThemeState(preferences.theme)
    }
  }, [preferences?.theme])

  // 4. Mark mounted so we can avoid hydration mismatches if needed
  useEffect(() => {
    setMounted(true)
  }, [])

  // 5. Public setter: updates local state + localStorage + DB
  const setTheme = useCallback((newTheme) => {
    if (newTheme !== "light" && newTheme !== "dark") return
    setThemeState(newTheme)
    window.localStorage.setItem("goaliq-theme", newTheme)
    // Fire-and-forget DB sync
    if (status === "authenticated" && updatePreferences) {
      updatePreferences({ theme: newTheme }).catch(() => {})
    }
  }, [status, updatePreferences])

  const resolvedTheme = theme === "dark" ? "dark" : "light"

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme, mounted }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}