"use client"

import { createContext, useContext, useState } from "react"

const SignInContext = createContext()

export function SignInProvider({ children }) {

  const [showSignIn, setShowSignIn] =
    useState(false)

  return (
    <SignInContext.Provider
      value={{
        showSignIn,
        setShowSignIn,
      }}
    >
      {children}
    </SignInContext.Provider>
  )
}

export function useSignIn() {
  return useContext(SignInContext)
}