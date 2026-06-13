"use client"

import { useSearchParams } from "next/navigation"

export default function AuthErrorClient() {
  const params = useSearchParams()
  const error = params.get("error")

  return (
    <div style={{ padding: "40px" }}>
      <h1>Login Error</h1>
      <p>Something went wrong during login.</p>

      <p style={{ color: "red" }}>
        {error}
      </p>
    </div>
  )
}