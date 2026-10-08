// scripts/redis-check.mjs
// Separates "Redis/limiter problem" from "Next.js dev server problem".
// Run from the project root (Node 20.6+):
//   node --env-file=.env.local scripts/redis-check.mjs
// It uses its own key prefix (rl:check), so it never touches real limits.

import { Redis } from "@upstash/redis"
import { Ratelimit } from "@upstash/ratelimit"

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN

console.log("URL set:  ", Boolean(url), url ? `(${new URL(url).host})` : "")
console.log("Token set:", Boolean(token))

if (!url || !token) {
  console.error("\nMissing env vars. Is the file name/path in --env-file correct?")
  process.exit(1)
}

const redis = new Redis({ url, token })

console.log("\nPing latency:")
for (let i = 1; i <= 3; i++) {
  const t0 = performance.now()
  await redis.ping()
  console.log(`  #${i}: ${Math.round(performance.now() - t0)}ms`)
}

const rl = new Ratelimit({
  redis,
  limiter: Ratelimit.tokenBucket(5, "1 s", 40),
  prefix: "rl:check",
  analytics: false,
  timeout: 5000,
})

console.log("\nTen sequential limit() calls:")
for (let i = 1; i <= 10; i++) {
  const t0 = performance.now()
  const r = await rl.limit("diagnostic")
  console.log(
    `  #${i}`,
    `success=${r.success}`,
    `limit=${r.limit}`,
    `remaining=${r.remaining}`,
    `${Math.round(performance.now() - t0)}ms`
  )
}
