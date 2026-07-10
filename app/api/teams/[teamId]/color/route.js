import { redis } from "@/lib/redis"
import { Jimp, intToRGBA } from "jimp"
import { MANUAL_TEAM_COLORS } from "@/lib/teamColors"

// defensive: falls back to raw buffer indexing if getPixelColor isn't where expected —
// we've been burned twice already by this package's API shifting across versions
function getPixelRGBA(image, x, y) {
  if (typeof image.getPixelColor === "function" && typeof intToRGBA === "function") {
    return intToRGBA(image.getPixelColor(x, y))
  }
  const idx = (image.bitmap.width * y + x) * 4
  return {
    r: image.bitmap.data[idx],
    g: image.bitmap.data[idx + 1],
    b: image.bitmap.data[idx + 2],
    a: image.bitmap.data[idx + 3],
  }
}

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

    const { width, height } = image.bitmap

    let r = 0,
      g = 0,
      b = 0,
      count = 0

    // sample every 4th pixel instead of resizing first — avoids depending on
    // .resize()'s exact signature, which has changed across Jimp major versions
    for (let y = 0; y < height; y += 4) {
      for (let x = 0; x < width; x += 4) {
        const { r: red, g: green, b: blue, a: alpha } = getPixelRGBA(image, x, y)

        if (alpha < 128) continue
        const isNearWhite = red > 235 && green > 235 && blue > 235
        const isNearBlack = red < 20 && green < 20 && blue < 20
        if (isNearWhite || isNearBlack) continue

        r += red
        g += green
        b += blue
        count++
      }
    }

    const color =
      count === 0
        ? "#465261"
        : `#${[r, g, b].map((v) => Math.round(v / count).toString(16).padStart(2, "0")).join("")}`

    const payload = { color, source: "extracted", sampledPixels: count }

    await redis.set(cacheKey, payload, { ex: 60 * 60 * 24 * 90 })

    return Response.json({ success: true, data: payload })
  } catch (error) {
    // TEMPORARY: exposing message+stack so we can see the exact failure instead of guessing.
    // Remove `stack` once this is confirmed working.
    return Response.json({ success: false, message: error.message, stack: error.stack }, { status: 500 })
  }
}