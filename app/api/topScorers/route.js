export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)

    const league = searchParams.get("league")
    const season = searchParams.get("season")

    if (!league || !season) {
      return Response.json(
        {
          success: false,
          message: "League and season are required",
        },
        {
          status: 400,
        }
      )
    }

    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?league=${league}&season=${season}`,
      {
        headers: {
          "x-apisports-key": process.env.API_FOOTBALL_KEY,
        },
      }
    )

    const data = await res.json()

    return Response.json({
      success: true,
      data: data.response,
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      {
        status: 500,
      }
    )
  }
}