import { withRateLimit } from "@/lib/withRateLimit"

async function getHandler() {
  return Response.json({
    success: true,
    message: "Rate limit test request succeeded",
    timestamp: Date.now(),
  })
}

export const GET = withRateLimit(getHandler, {
  limiter: "read",
})