"use client"

import { getFavourites } from "@/services/favourites"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"
import { useFavorites } from "@/context/favoriteContext"

function GetFavourites() {
  const { favorites, setFavorites } = useFavorites()
  useEffect(() => {
    getFavourites().then((res) => {
      if (res.success) {
        setFavorites( res?.data?.favorites)
      } else {
        toast.error("Error fetching favourites:", res.message)
      }
    })
  }, [])
    console.log("Favorites updated:", favorites) 
    return null
}

export default GetFavourites