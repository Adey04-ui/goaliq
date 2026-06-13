"use client"

import { createContext, useContext, useState } from "react"
import { useSession } from "next-auth/react"

const UserContext = createContext()

export function UserProvider({ children }) {

  const { data: session, status } = useSession()

  return (
    <UserContext.Provider
      value={{
        session,
        status,
      }}
    >
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  return useContext(UserContext)
}