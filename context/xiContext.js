// context/xiContext.js
"use client"

import { createContext, useContext } from "react"
import useSWR from "swr"
import { useSession } from "next-auth/react"

const XIContext = createContext()

const fetcher = async (url) => {
  const res = await fetch(url)
  const result = await res.json()
  if (!res.ok) throw new Error(result.message)
  return result
}

export function XIProvider({ children }) {
  const { status } = useSession()

  const { data, isLoading, mutate } = useSWR(
    status === "authenticated" ? "/api/xi" : null,
    fetcher,
    {
      dedupingInterval: 1000 * 60 * 5, // 5 mins
      revalidateOnFocus: false,
    }
  )

  const formation = data?.data?.formation ?? "4-3-3"
  const players = data?.data?.players ?? Array(11).fill(null)

  return (
    <XIContext.Provider value={{ formation, players, isLoading, mutate }}>
      {children}
    </XIContext.Provider>
  )
}

export function useXI() {
  return useContext(XIContext)
}