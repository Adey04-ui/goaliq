"use client"

import { createContext, useContext, useState } from "react"

const FavoritesContext = createContext()

export function FavoritesProvider({ children }) {

  const [favorites, setFavorites] = useState({
    team: [],
    league: [],
  })

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        setFavorites,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  return useContext(FavoritesContext)
}