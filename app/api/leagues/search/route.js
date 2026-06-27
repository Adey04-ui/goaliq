import { getSearchIndex } from "@/services/leaguesCache"

export async function GET(request) {
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
    return Response.json(
      { success: false, message: error.message },
      { status: 500 }
    )
  }
}