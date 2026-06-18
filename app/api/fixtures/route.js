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
        { status: 400 }
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

    const fixtures = data.response.filter(
      (match) => match.fixture.status.short === "NS"
    )

    const results = data.response.filter(
      (match) =>
        ["FT", "AET", "PEN"].includes(
          match.fixture.status.short
        )
    )

    const live = data.response.filter(
      match =>
        [
          "1H",
          "HT",
          "2H",
          "ET",
          "BT",
          "LIVE"
        ].includes(match.fixture.status.short)
    )

    return Response.json({
      success: true,
      data: {
        fixtures,
        results,
        live,
      },
    })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: error.message,
      },
      { status: 500 }
    )
  }
}