import { withRateLimit } from "@/lib/withRateLimit"
import { fetchApiFootball, apiFootballErrorResponse } from "@/lib/apiFootball"

async function getHandler(request) {
  const { searchParams } = new URL(request.url);

  const league = searchParams.get("league");
  const season = searchParams.get("season");

  const res = await fetchApiFootball(`/teams?league=${league}&season=${season}`, {
      headers: {
        "x-apisports-key": process.env.API_FOOTBALL_KEY,
      },
    }
  );

  const data = await res.data;

  return Response.json(data);
}

export const GET = withRateLimit(getHandler, { limiter: "read" });