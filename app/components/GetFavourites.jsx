"use client"

import { getFavourites } from "@/services/favourites"
import { useEffect, useState } from "react"
import { useToast } from "@/lib/useToast"
import { useFavorites } from "@/context/favoriteContext"
import { useUser } from "@/context/userContext"

function GetFavourites() {
  const { favorites, setFavorites } = useFavorites()
  const { status } = useUser()
  const { success, error } = useToast()

  useEffect(() => {
    if (status !== "authenticated") {
      setFavorites([])
      return
    }
    try {
      getFavourites().then((res) => {
        if (res.success) {
          setFavorites(res?.data?.favorites)
        } else {
          console.error("Error fetching favourites:", res.message)
        }
      })
    } catch (error) {
      console.error("Error fetching favourites:", error)
    }
  }, [status])
  console.log("Favorites updated:", favorites)
  return null
}

export default GetFavourites