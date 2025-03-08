"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2, Utensils, Dice1Icon as DiceIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Restaurant {
  id: string
  name: string
  cuisine: string
  rating: number
  distance: string
}

const cuisineCategories = [
  { value: "European restaurant", label: "European" },
  { value: "Goan restaurant", label: "Goan" },
  { value: "Pan-Asian restaurant", label: "Pan-Asian" },
  { value: "Mediterranean restaurant", label: "Mediterranean" },
  { value: "North Indian restaurant", label: "North Indian" },
  { value: "Cantonese restaurant", label: "Cantonese" },
  { value: "Arab restaurant", label: "Arab" },
  { value: "Biryani restaurant", label: "Biryani" },
  { value: "Steak house", label: "Steak House" },
  { value: "Barbecue restaurant", label: "Barbecue" },
  { value: "Buffet restaurant", label: "Buffet" },
  { value: "Fine dining restaurant", label: "Fine Dining" },
  { value: "Italian restaurant", label: "Italian" },
  { value: "Vegetarian restaurant", label: "Vegetarian" },
  { value: "Seafood restaurant", label: "Seafood" },
  { value: "Fast food restaurant", label: "Fast Food" },
  { value: "Burmese restaurant", label: "Burmese" },
  { value: "South Indian restaurant", label: "South Indian" },
  { value: "Brewpub", label: "Brewpub" },
  { value: "Fusion restaurant", label: "Fusion" },
  { value: "Asian restaurant", label: "Asian" },
  { value: "Eclectic restaurant", label: "Eclectic" },
  { value: "Andhra restaurant", label: "Andhra" },
  { value: "Non Vegetarian Restaurant", label: "Non Vegetarian" },
  { value: "Middle Eastern restaurant", label: "Middle Eastern" },
  { value: "Mexican restaurant", label: "Mexican" },
  { value: "Indian restaurant", label: "Indian" },
  { value: "Japanese restaurant", label: "Japanese" },
  { value: "Chinese restaurant", label: "Chinese" },
  { value: "Continental restaurant", label: "Continental" },
  { value: "Restaurant", label: "Restaurant" },
  { value: "Turkish restaurant", label: "Turkish" },
  { value: "Modern Indian restaurant", label: "Modern Indian" },
  { value: "Bar & grill", label: "Bar & Grill" },
  { value: "Brewery", label: "Brewery" },
  { value: "Bar", label: "Bar" },
  { value: "Thai restaurant", label: "Thai" },
  { value: "Organic restaurant", label: "Organic" },
  { value: "Cocktail bar", label: "Cocktail Bar" },
  { value: "Lounge", label: "Lounge" },
  { value: "French restaurant", label: "French" }
];

export default function Home() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([])
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState("")
  const [cuisine, setCuisine] = useState("")

  async function fetchRestaurants(searchLocation: string, cuisineType: string) {
    setLoading(true)
    try {

      console.log("Sending request:", JSON.stringify({
        query: searchLocation.trim(), // Ensures no accidental spaces
        city: searchLocation,
        category: cuisineType || "Japanese restaurant", // Default value
      }));      
      const response = await fetch("http://localhost:8000/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: searchLocation.trim(),
          city: "Bangalore",
          category: cuisineType
        }),
      });
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
  

  async function handleSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!location || !cuisine) return
    await fetchRestaurants(location, cuisine)
  }

  async function handleRandomSearch() {
    if (!location) return
    const randomCuisine = cuisineCategories[Math.floor(Math.random() * cuisineCategories.length)].value
    setCuisine(randomCuisine)
    await fetchRestaurants(location, randomCuisine)
  }

  return (
    <main className="min-h-screen bg-[#FFD66B] p-4 md:p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-lg p-6 md:p-12">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16">
          <h1 className="text-xl font-bold">NEXT UP!</h1>
          <div className="hidden md:flex gap-8">
            <a href="https://subscribedd.vercel.app" className="hover:text-orange-500">
              Subscribe: Not A Newsletter
            </a>
            <a href="https://linkedin.com/in/amanjaiswalofficial" className="hover:text-orange-500">
              LinkedIn
            </a>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Get local food recommendations
            <br />
            wherever you go.
          </h2>
          {/* <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
            Enter your cuisine preference and the vibe you feel like going for
          </p> */}

          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex flex-col gap-4 max-w-xl mx-auto mb-12">
            <div className="flex gap-4">
              <Input
                type="text"
                placeholder="What do you feel like having"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="flex-1"
              />
              <Select value={cuisine} onValueChange={setCuisine}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Cuisine" />
                </SelectTrigger>
                <SelectContent>
                  {cuisineCategories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={loading || !location || !cuisine}
              >
                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
                Find Food
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="flex-1"
                onClick={handleRandomSearch}
                disabled={loading || !location}
              >
                <DiceIcon className="mr-2 h-4 w-4" />
                I'm Feeling Lucky
              </Button>
            </div>
          </form>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center gap-4 text-gray-500">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p>Finding the best restaurants for you...</p>
            </div>
          ) : restaurants.length > 0 ? (
            <div className="space-y-8">
              <div className="grid gap-4 max-w-2xl mx-auto">
                {restaurants.map((restaurant) => (
                  <div
                    key={restaurant.id}
                    className="flex justify-between items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-orange-100 rounded-full text-orange-500">
                        <Utensils className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{restaurant.name}</h3>
                        {/* <p className="text-sm text-gray-500">{restaurant.cuisine}</p> */}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{restaurant.rating}★</div>
                      {/* <div className="text-sm text-gray-500">{restaurant.distance}</div> */}
                    </div>
                  </div>
                ))}
              </div>

              {/* Decorative Graphics */}
              {/* <div className="flex justify-center gap-8 py-8">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 animate-bounce">
                  <Utensils className="h-8 w-8" />
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 animate-bounce [animation-delay:200ms]">
                  <Utensils className="h-8 w-8" />
                </div>
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 animate-bounce [animation-delay:400ms]">
                  <Utensils className="h-8 w-8" />
                </div>
              </div> */}
            </div>
          ) : null}
        </div>

      </div>
    </main>
  )
}

