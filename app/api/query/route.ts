import { type NextRequest, NextResponse } from "next/server"
import { parseUserQuery } from "@/lib/llm/router"
import { generateTagline } from "@/lib/llm/copy"
import { loadPlaces, loadVibes, findVibeBySlug, rankPlaces } from "@/lib/data/loadPlaces"

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json()

    console.log("Query received:", query)

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 })
    }

    // Load data
    const [places, vibes] = await Promise.all([
      loadPlaces("monterrey"), // Por ahora default, después añadir selección de ciudad
      loadVibes(),
    ])

    console.log(`Loaded ${places.length} places and ${vibes.length} vibes`)

    if (places.length === 0) {
      return NextResponse.json({ error: "No places found" }, { status: 404 })
    }

    // Buscar vibe exacto por slug primero
    let selectedVibe = findVibeBySlug(vibes, query)
    let vibeSlug = query
    let intent = "spot"

    if (!selectedVibe) {
      // Fallback: usar LLM router para texto libre
      console.log("Vibe not found by slug, using LLM router")
      try {
        const parsed = await parseUserQuery(query)
        vibeSlug = parsed.vibe
        intent = parsed.intent

        // Buscar vibe por el slug que devolvió el LLM
        selectedVibe = findVibeBySlug(vibes, vibeSlug)

        if (!selectedVibe) {
          // Si aún no encuentra, buscar por tags o descripción
          selectedVibe = vibes.find(
            (v) =>
              v.tags.some((tag) => tag.toLowerCase().includes(vibeSlug.toLowerCase())) ||
              v.desc.toLowerCase().includes(vibeSlug.toLowerCase()),
          )
        }
      } catch (llmError) {
        console.error("LLM router error:", llmError)
      }
    }

    if (!selectedVibe) {
      return NextResponse.json(
        { error: "Vibe not found", available_vibes: vibes.slice(0, 10).map((v) => v.id) },
        { status: 404 },
      )
    }

    console.log("Selected vibe:", selectedVibe.id)

    // Rank and filter places
    const rankedPlaces = rankPlaces(places, selectedVibe, vibeSlug)
    const resultCount = intent === "spot" ? 1 : 3
    const selectedPlaces = rankedPlaces.slice(0, Math.max(resultCount, 10)) // Top 10 para taglines

    console.log(`Selected ${selectedPlaces.length} places`)

    // Generate taglines para los primeros 10
    const taglinePromises = selectedPlaces.slice(0, 10).map(async (place, index) => {
      try {
        const tagline = await generateTagline(place, vibeSlug)
        return { ...place, tagline }
      } catch (error) {
        console.error(`Error generating tagline for ${place.name}:`, error)
        return { ...place, tagline: `${place.name} está padrísimo` }
      }
    })

    const placesWithTaglines = await Promise.all(taglinePromises)

    // Solo devolver el número correcto según intent
    const finalPlaces = placesWithTaglines.slice(0, resultCount)

    return NextResponse.json({
      vibe: selectedVibe.id,
      intent,
      places: finalPlaces,
      query_processed: query,
      debug: {
        total_places: places.length,
        ranked_places: rankedPlaces.length,
        selected_vibe: selectedVibe.id,
        vibe_vector: selectedVibe.v,
      },
    })
  } catch (error) {
    console.error("Query API error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to query places" }, { status: 405 })
}
