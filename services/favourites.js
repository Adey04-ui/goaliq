export async function toggleFavourite(data) {
  const res = await fetch("/api/favourites", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message)
  }

  return result
}