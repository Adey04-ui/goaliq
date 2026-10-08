import { redis } from "@/lib/redis"

export async function GET() {
  const start = Date.now()

  try {
    const result = await redis.ping()
    const duration = Date.now() - start

    console.log("[redis-test]", {
      result,
      duration: `${duration}ms`,
    })

    return Response.json({
      success: true,
      result,
      duration,
    })
  } catch (error) {
    const duration = Date.now() - start

    console.error("[redis-test] failed", {
      duration: `${duration}ms`,
      error: error.message,
    })

    return Response.json(
      {
        success: false,
        duration,
        error: error.message,
      },
      { status: 500 }
    )
  }
}