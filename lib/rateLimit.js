// lib/rateLimit.js
// Layer 1: token-bucket limiters for Redis-backed (cached) routes.
// Uses @upstash/ratelimit. State lives in Upstash Redis, so it works on
// Vercel serverless (module-level memory does not).

import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis.js';

// If GoalIQ already exports a shared Redis client (e.g. lib/redis.js),
// import that instead of creating a second one.

// tokenBucket(refillRate, interval, maxTokens)
//   refillRate: tokens added every `interval`
//   maxTokens:  bucket capacity = the largest burst allowed

const TIMEOUT_MS = process.env.NODE_ENV === 'production' ? 1500 : 5000
//
// Keys are stored as `${prefix}:${identifier}` -> rl:read:<ip>
export const limiters = {
  // Cached GET routes (leagues, standings, squads, news).
  // A page load can fire many SWR requests at once, so the burst is generous.
  read: new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(5, '1 s', 40),
    prefix: 'rl:read',
    analytics: false,
    timeout: TIMEOUT_MS, // if Redis is slow/unreachable, fail OPEN after 1.5s
  }),

  // Mutations (favorites, notifications, etc.) - tighter.
  write: new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(1, '1 s', 10),
    prefix: 'rl:write',
    analytics: false,
    timeout: TIMEOUT_MS,
  }),

  // Avatar uploads: each one costs a Cloudinary transformation, so keep it
  // tight. Burst of 3, then one more every 30 seconds.
  upload: new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(1, '30 s', 3),
    prefix: 'rl:upload',
    analytics: false,
    timeout: TIMEOUT_MS,
  }),

  analytics: new Ratelimit({
    redis,
    limiter: Ratelimit.tokenBucket(5, "1 s", 30),
    prefix: "rl:analytics",
    analytics: false,
    timeout: TIMEOUT_MS,
  }),
};