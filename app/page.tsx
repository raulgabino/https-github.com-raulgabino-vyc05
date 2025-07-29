"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { VibeSelector } from "@/components/VibeSelector"
import { PlaceCard } from "@/components/PlaceCard"
import { RandomRouteButton } from "@/components/RandomRouteButton"
import { RoutePreview } from "@/components/RoutePreview"
import { ArticleSheet } from "@/components/ArticleSheet"
import { useShare } from "@/lib/hooks/useShare"
import { MapPin } from "lucide-react"
import type { Place, RouteData, City, Vibe } from "@/lib/types"

type PlaceWithTagline = Place & { tagline?: string }

const cities: { id: City; name: string }[] = [
  { id: "monterrey", name: "Monterrey" },
  { id: "cdmx", name: "CDMX" },
  { id: "guadalajara", name: "Guadalajara" },
  { id: "guanajuato", name: "Guanajuato" },
  { id: "cdvictoria", name: "Cd. Victoria" },
]

export default function Home() {
  const [selectedCity, setSelectedCity] = useState<City>("monterrey")
  const [selectedVibe, setSelectedVibe] = useState<string>("")
  const [vibes, setVibes] = useState<Vibe[]>([])
  const [places, setPlaces] = useState<PlaceWithTagline[]>([])
  const [loading, setLoading] = useState(false)
  const [currentRoute, setCurrentRoute] = useState<RouteData | null>(null)
  const [showArticle, setShowArticle] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { shareRoute, sharePlace } = useShare()

  // Load vibes on mount
  useEffect(() => {
    const loadVibes = async () => {
      try {
        const response = await fetch("/data/vibes.json")
        if (response.ok) {
          const data = await response.json()
          setVibes(data.vibes || [])
          console.log("✅ Loaded vibes:", data.vibes?.length || 0)
        }
      } catch (error) {
        console.error("❌ Error loading vibes:", error)
        setError("Error cargando las vibras")
      }
    }

    loadVibes()
  }, [])

  const handleVibeSelect = async (vibe: string) => {
    console.log("🎯 Vibe selected:", vibe)
    setSelectedVibe(vibe)
    setCurrentRoute(null)
    setError(null)

    if (!vibe) return

    setLoading(true)
    try {
      console.log("📡 Sending request to /api/query...")
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: vibe }),
      })

      console.log("📡 Response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Search results:", data)

        setPlaces(data.places || [])

        if (!data.places || data.places.length === 0) {
          setError("No se encontraron lugares para esa vibra")
        }
      } else {
        const errorData = await response.json()
        console.error("❌ Search failed:", errorData)
        setError(`Error en la búsqueda: ${errorData.error || "Error desconocido"}`)
        setPlaces([])
      }
    } catch (error) {
      console.error("❌ Search error:", error)
      setError("Error de conexión. Intenta de nuevo.")
      setPlaces([])
    } finally {
      setLoading(false)
    }
  }

  const handleRouteGenerated = (route: RouteData) => {
    setCurrentRoute(route)
    setPlaces([])
  }

  const handleShare = async () => {
    if (currentRoute) {
      const result = await shareRoute(currentRoute)
      console.log("Share result:", result)
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center mb-2">YourCityVibes</h1>
          <p className="text-center text-muted-foreground">Encuentra lugares que van con tu vibra</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* City Selection */}
        <div className="flex justify-center">
          <div className="flex gap-2 p-1 bg-secondary rounded-lg">
            {cities.map((city) => (
              <Button
                key={city.id}
                variant={selectedCity === city.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCity(city.id)}
                className="text-sm"
              >
                <MapPin className="mr-1 h-3 w-3" />
                {city.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Vibe Selector */}
        <div className="max-w-2xl mx-auto">
          <VibeSelector selectedVibe={selectedVibe} onVibeSelect={handleVibeSelect} vibes={vibes} />
        </div>

        {/* Random Route Button */}
        {selectedVibe && (
          <div className="flex justify-center">
            <RandomRouteButton city={selectedCity} vibe={selectedVibe} onRouteGenerated={handleRouteGenerated} />
          </div>
        )}

        {/* Error Display */}
        {error && <div className="text-center text-red-500 bg-red-50 p-4 rounded-lg">{error}</div>}

        {/* Results */}
        {currentRoute && (
          <RoutePreview route={currentRoute} onReadArticle={() => setShowArticle(true)} onShare={handleShare} />
        )}

        {places.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-center">Lugares con vibra {selectedVibe}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {places.map((place) => (
                <PlaceCard key={place.id} place={place} onClick={() => sharePlace(place)} />
              ))}
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center text-muted-foreground">
            <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full mr-2"></div>
            Buscando lugares con esa vibra...
          </div>
        )}

        {selectedVibe && !loading && places.length === 0 && !currentRoute && !error && (
          <div className="text-center text-muted-foreground">
            No encontramos lugares con esa vibra. Prueba con otra.
          </div>
        )}
      </main>

      {/* Article Sheet */}
      <ArticleSheet
        route={currentRoute}
        isOpen={showArticle}
        onClose={() => setShowArticle(false)}
        onShare={handleShare}
      />
    </div>
  )
}
