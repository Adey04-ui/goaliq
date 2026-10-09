import { getSearchIndex } from "@/services/leaguesCache"
import { withRateLimit } from "@/lib/withRateLimit"
import { routeErrorResponse } from "@/lib/apiFootball"

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get("q")?.toLowerCase() ?? ""

    if (q.length < 2) {
      return Response.json({ success: true, data: [] })
    }

    const index = await getSearchIndex()

    const results = index.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.country.toLowerCase().includes(q)
    )

    return Response.json({ success: true, data: results })

  } catch (error) {
    return routeErrorResponse(error, "leagues")
  }
}

export const GET = withRateLimit(getHandler, { limiter: "read" })