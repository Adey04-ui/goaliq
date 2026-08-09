"use client"

import { useEffect } from "react"
import { useUser } from "@/context/userContext"

export default function ThemeWrapper({ children }) {
  const { preferences } = useUser()
  const theme = preferences?.theme || "dark"

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme)
    document.documentElement.setAttribute("lang", preferences?.language || "en")
  }, [theme, preferences?.language])

  return <>{children}</>
}