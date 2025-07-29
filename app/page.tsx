"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MapPin, Search } from "lucide-react"
import { PlaceCard } from "@/components/PlaceCard"
import { RandomRouteButton } from "@/components/RandomRouteButton"
import { VibeSelector } from "@/components/VibeSelector"
import type { Place } from "@/lib/types"

const cities = [
  { id: "monterrey", name: "Monterrey", icon: "🏔️" },
  { id: "cdmx", name: "CDMX", icon: "🏛️" },
  { id: "guadalajara", name: "Guadalajara", icon: "🌮" },
  { id: "guanajuato", name: "Guanajuato", icon: "🎨" },
  { id: "cdvictoria", name: "Cd. Victoria", icon: "🌵" },
]

export default function HomePage() {
  const [selectedCity, setSelectedCity] = useState("cdmx")
  const [searchQuery, setSearchQuery] = useState("")
  const [places, setPlaces] = useState<Place[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentVibe, setCurrentVibe] = useState<string>("")

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    setIsLoading(true)
    setError(null)
    console.log("🔍 Starting search for:", searchQuery)

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: searchQuery }),
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Response data:", data)

        setPlaces(data.places || [])
        setCurrentVibe(data.vibe?.slug || searchQuery)
      } else {
        const errorData = await response.json()
        console.error("❌ API Error:", errorData)
        setError(errorData.error || "Error en la búsqueda")
      }
    } catch (error) {
      console.error("❌ Network Error:", error)
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVibeSelect = async (vibe: string) => {
    setIsLoading(true)
    setError(null)
    setCurrentVibe(vibe)
    console.log("🎯 Vibe selected:", vibe)

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: vibe }),
      })

      console.log("📡 Vibe response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Vibe response data:", data)

        setPlaces(data.places || [])
      } else {
        const errorData = await response.json()
        console.error("❌ Vibe API Error:", errorData)
        setError(errorData.error || "Error al buscar vibra")
      }
    } catch (error) {
      console.error("❌ Vibe Network Error:", error)
      setError("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2">YourCityVibes</h1>
          <p className="text-gray-400">Encuentra lugares que van con tu vibra</p>
        </div>

        {/* City Selection */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {cities.map((city) => (
            <Button
              key={city.id}
              variant={selectedCity === city.id ? "default" : "outline"}
              onClick={() => setSelectedCity(city.id)}
              className={`${
                selectedCity === city.id
                  ? "bg-white text-black hover:bg-gray-200"
                  : "border-gray-600 text-gray-300 hover:bg-gray-800"
              }`}
            >
              <MapPin className="w-4 h-4 mr-2" />
              {city.name}
            </Button>
          ))}
        </div>

        {/* Vibe Selector */}
        <VibeSelector onVibeSelect={handleVibeSelect} />

        {/* Search Bar */}
        <div className="flex gap-2 mb-8 max-w-2xl mx-auto">
          <Input
            placeholder="Busca entre 450+ vibes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
            className="bg-gray-900 border-gray-700 text-white placeholder-gray-400"
          />
          <Button onClick={handleSearch} disabled={isLoading}>
            <Search className="w-4 h-4" />
            {isLoading ? "Buscando..." : "Buscar"}
          </Button>
        </div>

        {/* Random Route Button */}
        <div className="text-center mb-8">
          <RandomRouteButton city={selectedCity} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-500 text-red-300 px-4 py-3 rounded mb-6">{error}</div>
        )}

        {/* Results */}
        {places.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center">Lugares con vibra {currentVibe}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {places.map((place, index) => (
                <PlaceCard key={place.id || index} place={place} />
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-gray-400">Buscando lugares perfectos para ti...</p>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && places.length === 0 && !error && currentVibe && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-lg">No se encontraron lugares para esta vibra</p>
            <p className="text-gray-500 mt-2">Intenta con otra búsqueda</p>
          </div>
        )}
      </div>
    </div>
  )
}
