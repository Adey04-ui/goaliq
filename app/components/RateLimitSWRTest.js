"use client"

import { useState } from "react"
import useSWR from "swr"

const TEST_URL = "/api/standings?league=39&season=2022"

export default function RateLimitSWRTest() {
  const [keys, setKeys] = useState([])

  const startTest = () => {
    setKeys(
      Array.from(
        { length: 60 },
        (_, index) =>
          `${TEST_URL}&request=${index + 1}`
      )
    )
  }

  return (
    <div>
      <button onClick={startTest}>
        Test Rate Limit
      </button>

      {keys.map((key) => (
        <TestRequest key={key} url={key} />
      ))}
    </div>
  )
}

function TestRequest({ url }) {
  const { error } = useSWR(url, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return null
}