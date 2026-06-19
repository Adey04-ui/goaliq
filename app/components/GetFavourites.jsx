"use client"

import { getFavourites } from "@/services/favourites"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useFavorites } from "@/context/favoriteContext"

function GetFavourites() {
  const { favorites, setFavorites } = useFavorites()
  useEffect(() => {
    getFavourites("TEAM").then((res) => {
      if (res.success) {
        setFavorites((prev) => ({ ...prev, team: res?.data?.favorites }))
      } else {
        toast.error("Error fetching favourites:", res.message)
      }
    })

    getFavourites("LEAGUE").then((res) => {
      if (res.success) {
        setFavorites((prev) => ({ ...prev, league: res?.data?.favorites }))
      } else {
        toast.error("Error fetching favourites:", res.message)
      }
    })
  }, [])
    console.log("Favorites updated:", favorites) 
}

export default GetFavourites