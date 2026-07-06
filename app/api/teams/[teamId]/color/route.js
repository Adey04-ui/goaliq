import { redis } from "@/lib/redis"
import Jimp from "jimp"
import { MANUAL_TEAM_COLORS } from "@/lib/teamColors"

export async function GET(request, { params }) {
  try {
    const { teamId } = await params

    if (MANUAL_TEAM_COLORS[teamId]) {
      return Response.json({ success: true, data: { color: MANUAL_TEAM_COLORS[teamId], source: "manual" } })
    }

    const cacheKey = `team:color:${teamId}`
    const cached = await redis.get(cacheKey)
    if (cached) return Response.json({ success: true, data: cached })

    const logoUrl = `https://media.api-sports.io/football/teams/${teamId}.png`
    const image = await Jimp.read(logoUrl)
    image.resize(32, 32)

    let r = 0,
      g = 0,
      b = 0,
      count = 0

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function (x, y, idx) {
      const alpha = this.bitmap.data[idx + 3]
      if (alpha < 128) return // skip transparent background

      const red = this.bitmap.data[idx]
      const green = this.bitmap.data[idx + 1]
      const blue = this.bitmap.data[idx + 2]

      // skip near-white and near-black — usually background fill or crest outline,
      // not the team's actual brand color. This is a filtered AVERAGE, not true
      // dominant-cluster extraction (no k-means/median-cut) — good enough for a
      // single accent color, but a logo with two strong contrasting colors
      // (e.g. red + blue) can average toward a muddy purple. Flag this if a
      // team's extracted color looks visibly wrong — that's the mechanism why.
      const isNearWhite = red > 235 && green > 235 && blue > 235
      const isNearBlack = red < 20 && green < 20 && blue < 20
      if (isNearWhite || isNearBlack) return

      r += red
      g += green
      b += blue
      count++
    })

    const color =
      count === 0
        ? "#465261" // whole logo got filtered out (pure black/white crest) — neutral fallback
        : `#${[r, g, b].map((v) => Math.round(v / count).toString(16).padStart(2, "0")).join("")}`

    const payload = { color, source: "extracted" }

    // logos never change — cache long-term
    await redis.set(cacheKey, payload, { ex: 60 * 60 * 24 * 90 })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    return Response.json({ success: false, message: error.message }, { status: 500 })
  }
}