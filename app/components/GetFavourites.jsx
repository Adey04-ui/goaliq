"use client"

import { getFavourites } from "@/services/favourites"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useFavorites } from "@/context/favoriteContext"
import { useUser } from "@/context/userContext"

function GetFavourites() {
  const { favorites, setFavorites } = useFavorites()
  const { status } = useUser()

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
          toast.error("Error fetching favourites:", res.message)
        }
      })
    } catch (error) {
      console.error("Error fetching favourites:", error)
      toast.error("Error fetching favourites")
    }
  }, [status])
  console.log("Favorites updated:", favorites)
  return null
}

export default GetFavourites