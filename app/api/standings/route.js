export async function GET() {
  const response = await fetch(
    "https://v3.football.api-sports.io/standings?league=39&season=2022",
    {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
    }
  )

  const data = await response.json()

  return Response.json(data)
}