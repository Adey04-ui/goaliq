export async function toggleFavourite(data) {
  try {
    const res = await fetch("/api/favourites", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    const result = await res.json()

    if (!res.ok) {
      return {
        success: false,
        message: result.message,
      }
    }

    return {
      success: true,
      data: result,
    }
  } catch (error) {
    return {
      success: false,
      message: error.message,
    }
  }
}