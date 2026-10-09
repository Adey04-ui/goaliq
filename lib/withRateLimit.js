import { NextResponse } from 'next/server';
import { limiters } from './rateLimit';

const LIMITS = {
  read: 40,
  write: 10,
  upload: 3,
  analytics: 30,
};

export function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  return request.headers.get('x-real-ip') || 'anonymous';
}

function setRateLimitHeaders(headers, result, limiter) {
  headers.set(
    'X-RateLimit-Limit',
    String(LIMITS[limiter])
  );

  headers.set(
    'X-RateLimit-Remaining',
    String(Math.max(0, result.remaining))
  );
}

export function withRateLimit(
  handler,
  { limiter = 'read', identify } = {}
) {
  const rl = limiters[limiter];

  if (!rl) {
    throw new Error(
      `withRateLimit: unknown limiter "${limiter}"`
    );
  }

  return async function rateLimited(request, context) {
    let result;

    try {
      const id = identify
        ? await identify(request)
        : getClientIp(request);

      result = await rl.limit(id);
    } catch (err) {
      console.error(
        '[rateLimit] check failed, allowing request:',
        err
      );

      return handler(request, context);
    }

    if (!result.success) {
      const retryAfter = Math.max(
        1,
        Math.ceil(
          (result.reset - Date.now()) / 1000
        )
      );

      const res = NextResponse.json(
        {
          error: 'Too many requests',
          retryAfter,
        },
        { status: 429 }
      );

      res.headers.set(
        'Retry-After',
        String(retryAfter)
      );

      setRateLimitHeaders(
        res.headers,
        result,
        limiter
      );

      return res;
    }

    const response = await handler(
      request,
      context
    );

    try {
      setRateLimitHeaders(
        response.headers,
        result,
        limiter
      );
    } catch {}

    return response;
  };
}