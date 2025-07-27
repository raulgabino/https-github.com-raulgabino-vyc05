"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Shuffle, Loader2 } from "lucide-react"
import type { City, RouteData } from "@/lib/types"

interface RandomRouteButtonProps {
  city: City
  vibe?: string
  onRouteGenerated: (route: RouteData) => void
  className?: string
}

export function RandomRouteButton({ city, vibe = "explorar", onRouteGenerated, className }: RandomRouteButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleGenerateRoute = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/route/random", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ city, vibe }),
      })

      if (!response.ok) {
        throw new Error("Failed to generate route")
      }

      const routeData: RouteData = await response.json()
      onRouteGenerated(routeData)
    } catch (error) {
      console.error("Error generating route:", error)
      // TODO: Add toast notification
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleGenerateRoute} disabled={loading} className={className} variant="outline" size="lg">
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Generando...
        </>
      ) : (
        <>
          <Shuffle className="mr-2 h-4 w-4" />
          Ruta Random
        </>
      )}
    </Button>
  )
}
