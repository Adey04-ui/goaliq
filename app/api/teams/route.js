export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const league = searchParams.get("league");
  const season = searchParams.get("season");

  const res = await fetch(
    `https://v3.football.api-sports.io/teams?league=${league}&season=${season}`,
    {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
    }
  );

  const data = await res.json();

  return Response.json(data);
}