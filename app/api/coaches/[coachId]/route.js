import { NextResponse } from "next/server";
import { redis } from "@/lib/redis"; // adjust to your existing redis client import

const CACHE_TTL = 60 * 60 * 24; // 24h, same bucket as squad/player data per your TTL strategy

export async function GET(request, { params }) {
  const { coachId } = params;

  if (!coachId) {
    return NextResponse.json({ error: "coachId is required" }, { status: 400 });
  }

  const cacheKey = `coach:${coachId}`;

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      return NextResponse.json(JSON.parse(cached));
    }
  } catch (err) {
    console.error("Redis read failed for coach cache:", err);
    // fall through to live fetch — don't fail the request on cache miss
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/coachs?id=${coachId}`,
      {
        headers: { "x-apisports-key": process.env.API_FOOTBALL_KEY },
      }
    );

    const data = await res.json();

    // API-Football returns HTTP 200 even on plan/quota errors — must check this explicitly
    if (data.errors && Object.keys(data.errors).length > 0) {
      return NextResponse.json(
        { error: "API-Football error", details: data.errors },
        { status: 502 }
      );
    }

    const coach = data.response?.[0] || null;

    if (!coach) {
      return NextResponse.json({ error: "Coach not found" }, { status: 404 });
    }

    const payload = { coach };

    try {
      await redis.set(cacheKey, JSON.stringify(payload), { ex: CACHE_TTL });
    } catch (err) {
      console.error("Redis write failed for coach cache:", err);
    }

    return NextResponse.json(payload);
  } catch (err) {
    console.error("Coach fetch failed:", err);
    return NextResponse.json({ error: "Failed to fetch coach" }, { status: 500 });
  }
}