import { redis } from "@/lib/redis"

export async function GET() {
  const key = "fixtures:39:2022"

  const totalStart = performance.now()

  const redisStart = performance.now()

  const value = await redis.get(key)

  const redisDuration = performance.now() - redisStart
  const totalDuration = performance.now() - totalStart

  return Response.json({
    success: true,
    key,
    cacheHit: value !== null,
    redisDurationMs: Number(redisDuration.toFixed(2)),
    totalDurationMs: Number(totalDuration.toFixed(2)),
    timestamp: Date.now(),
  })
}