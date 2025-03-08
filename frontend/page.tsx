async function fetchRestaurants(searchLocation: string, cuisineType: string) {
  setLoading(true)
  try {
    const response = await fetch("http://localhost:8000/recommend", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: searchLocation,
        category: cuisineType,
      }),
    })
    const data = await response.json()

    // Ensure unique results
    const uniqueRestaurants = Array.from(new Map(data.map((r: any) => [r.place_name, r])).values())

    setRestaurants(
      uniqueRestaurants.map((r: any, index: number) => ({
        id: String(index),
        name: r.place_name,
        cuisine: cuisineType,
        rating: r.rating,
        distance: `${(Math.random() * 2).toFixed(1)} miles`, // Placeholder distance
      }))
    )
  } catch (error) {
    console.error("Failed to fetch restaurants:", error)
  } finally {
    setLoading(false)
  }
}