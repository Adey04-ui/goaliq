"use client"

import { createContext, useContext, useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { getFavourites } from "@/services/favourites"

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {
  const { status } = useSession()

  const [favorites, setFavorites] = useState({
    team: [],
    league: [],
    match: [],
  })

  useEffect(() => {
    // Only fetch when we know the user is logged in
    if (status !== "authenticated") return

    async function loadFavorites() {
      const result = await getFavourites()

      if (result.success && result.data?.data) {
        const raw = result.data.data // array of favorite records from DB

        // Group by type into the shape the rest of the app expects
        const grouped = {
          team: [],
          league: [],
          match: [],
        }

        for (const fav of raw) {
          const type = fav.type?.toLowerCase() // "LEAGUE" → "league"
          if (grouped[type] !== undefined) {
            grouped[type].push(fav)
          }
        }

        setFavorites(grouped)
      }
    }

    loadFavorites()
  }, [status]) // re-runs if status changes (e.g. user signs in mid-session)

  return (
    <FavoritesContext.Provider value={{ favorites, setFavorites }}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}