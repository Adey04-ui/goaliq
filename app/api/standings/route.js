import { NextResponse } from "next/server"

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const league = searchParams.get("league")
    const season = searchParams.get("season")

    if (!league || !season) {
      return NextResponse.json(
        { message: "League and season are required" },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://v3.football.api-sports.io/standings?league=${league}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
        next: {
          revalidate: 3600,
        },
      }
    )

    const data = await response.json()

    return NextResponse.json(data.response)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { message: "Failed to fetch standings" },
      { status: 500 }
    )
  }
}