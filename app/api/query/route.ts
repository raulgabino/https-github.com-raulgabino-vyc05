import { type NextRequest, NextResponse } from "next/server"
import { generateTagline } from "@/lib/llm/copy"

interface Place {
  id: string
  nombre?: string
  name?: string
  categoría?: string
  category?: string
  descripción_corta?: string
  description?: string
  playlists?: string[]
  tags?: string[]
  rating?: number
  rank_score?: number
  rango_precios?: string
}

interface Vibe {
  id: string
  v: number[]
  tags: string[]
  desc: string
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    console.log("=== QUERY API DEBUG ===")
    console.log("Query received:", query)

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Load places data
    console.log("Loading places data...")
    const placesResponse = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/data/places-monterrey.json`,
    )
    if (!placesResponse.ok) {
      console.error("Failed to load places:", placesResponse.status)
      return NextResponse.json({ error: "Failed to load places data" }, { status: 500 })
    }

    const placesData = await placesResponse.json()
    const rawPlaces = placesData.lugares || []
    console.log(`Loaded ${rawPlaces.length} raw places`)

    // Normalize places
    const places: Place[] = rawPlaces.map((place: any) => ({
      id: place.id?.toString() || "",
      name: place.nombre || place.name || "",
      category: place.categoría || place.category || "",
      description: place.descripción_corta || place.description || "",
      tags: place.playlists || place.tags || [],
      rating: place.rating || place.rank_score || 4.0,
      rango_precios: place.rango_precios || "$$",
    }))

    console.log(`Normalized ${places.length} places`)
    console.log("Sample place:", places[0])

    // Load vibes data
    console.log("Loading vibes data...")
    const vibesResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/data/vibes.json`)
    if (!vibesResponse.ok) {
      console.error("Failed to load vibes:", vibesResponse.status)
      return NextResponse.json({ error: "Failed to load vibes data" }, { status: 500 })
    }

    const vibesData = await vibesResponse.json()
    const vibes: Vibe[] = vibesData.vibes || []
    console.log(`Loaded ${vibes.length} vibes`)

    // Find matching vibe
    const selectedVibe = vibes.find((v) => v.id.toLowerCase() === query.toLowerCase())
    console.log("Selected vibe:", selectedVibe ? selectedVibe.id : "NOT FOUND")

    if (!selectedVibe) {
      // Fallback: buscar por tags o descripción
      const fallbackVibe = vibes.find(
        (v) =>
          v.tags.some((tag) => tag.toLowerCase().includes(query.toLowerCase())) ||
          v.desc.toLowerCase().includes(query.toLowerCase()),
      )

      if (fallbackVibe) {
        console.log("Found fallback vibe:", fallbackVibe.id)
      } else {
        console.log("No vibe found, using flexible search")
        // Búsqueda muy flexible
        const flexibleResults = places
          .filter(
            (place) =>
              place.name?.toLowerCase().includes(query.toLowerCase()) ||
              place.description?.toLowerCase().includes(query.toLowerCase()) ||
              place.category?.toLowerCase().includes(query.toLowerCase()) ||
              place.tags?.some((tag) => tag.toLowerCase().includes(query.toLowerCase())),
          )
          .slice(0, 3)

        console.log(`Flexible search found ${flexibleResults.length} places`)

        // Generate taglines
        const placesWithTaglines = await Promise.all(
          flexibleResults.map(async (place) => {
            try {
              const tagline = await generateTagline(place, query)
              return { ...place, tagline }
            } catch (error) {
              console.error(`Error generating tagline for ${place.name}:`, error)
              return { ...place, tagline: `${place.name} está padrísimo` }
            }
          }),
        )

        return NextResponse.json({
          vibe: query,
          intent: "spot",
          places: placesWithTaglines,
          query_processed: query,
          debug: {
            search_type: "flexible",
            total_places: places.length,
            found_places: flexibleResults.length,
          },
        })
      }
    }

    // Use selected vibe for filtering
    const vibeToUse = selectedVibe
    console.log("Using vibe for search:", vibeToUse.id)

    // Filter places by vibe tags
    const filteredPlaces = places.filter((place) => {
      // Buscar coincidencias entre vibe.tags y place.tags
      const hasMatch = vibeToUse.tags.some((vibeTag) =>
        place.tags?.some(
          (placeTag) =>
            placeTag.toLowerCase().includes(vibeTag.toLowerCase()) ||
            vibeTag.toLowerCase().includes(placeTag.toLowerCase()),
        ),
      )

      // También buscar en descripción y categoría
      const hasDescMatch = vibeToUse.tags.some(
        (vibeTag) =>
          place.description?.toLowerCase().includes(vibeTag.toLowerCase()) ||
          place.category?.toLowerCase().includes(vibeTag.toLowerCase()),
      )

      return hasMatch || hasDescMatch
    })

    console.log(`Filtered to ${filteredPlaces.length} places`)

    // Si no hay resultados, usar todos y rankear por rating
    const finalPlaces =
      filteredPlaces.length > 0
        ? filteredPlaces.slice(0, 3)
        : places.sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 3)

    console.log(`Final selection: ${finalPlaces.length} places`)
    console.log(
      "Final places:",
      finalPlaces.map((p) => p.name),
    )

    // Generate taglines
    const placesWithTaglines = await Promise.all(
      finalPlaces.map(async (place) => {
        try {
          const tagline = await generateTagline(place, query)
          return { ...place, tagline }
        } catch (error) {
          console.error(`Error generating tagline for ${place.name}:`, error)
          return { ...place, tagline: `${place.name} está padrísimo` }
        }
      }),
    )

    return NextResponse.json({
      vibe: vibeToUse.id,
      intent: "spot",
      places: placesWithTaglines,
      query_processed: query,
      debug: {
        total_places: places.length,
        filtered_places: filteredPlaces.length,
        selected_vibe: vibeToUse.id,
        vibe_tags: vibeToUse.tags,
      },
    })
  } catch (error) {
    console.error("=== QUERY API ERROR ===")
    console.error("Error details:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to query places" }, { status: 405 })
}
