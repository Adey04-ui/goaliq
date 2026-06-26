import { redis } from "@/lib/redis"

const getCacheKey = (userId) => `favorites:${userId}`

export async function getFavoritesCache(userId) {
  return await redis.get(getCacheKey(userId))
}

export async function setFavoritesCache(userId, favorites) {
  return await redis.set(
    getCacheKey(userId),
    favorites,
    {
      ex: 60 * 60, // 1 hour
    }
  )
}

export async function deleteFavoritesCache(userId) {
  return await redis.del(getCacheKey(userId))
}