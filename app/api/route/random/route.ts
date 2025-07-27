import { NextRequest, NextResponse } from "next/server"
import { generateArticle } from "@/lib/llm/copy"
import { loadPlaces, getRandomPlaces } from "@/lib/data/loadPlaces"
import type { City } from "@/lib/types"

function generateSlug(): string {
  const adjectives = ["epic", "cool", "wild", "fresh", "sick", "mad"]
  const nouns = ["ruta", "viaje", "tour", "spot", "aventura"]
  const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)]
  const randomNum = Math.floor(Math.random() * 999)

  return `${randomAdj}-${randomNoun}-${randomNum}`
}

export async function POST(request: NextRequest) {
  try {
    const { city, vibe } = await request.json()

    if (!city) {
      return NextResponse.json({ error: "City is required" }, { status: 400 })
    }

    const cityParam = city as City
    const vibeParam = vibe || "explorar"

    // Load places
    const places = await loadPlaces(cityParam)

    if (places.length === 0) {
      return NextResponse.json({ error: `No places found for ${city}` }, { status: 404 })
    }

    // Get 3 random places
    const selectedPlaces = getRandomPlaces(places, 3)

    // Generate article
    const article = await generateArticle(selectedPlaces, vibeParam)

    // Generate slug
    const slug = generateSlug()

    const routeData = {
      slug,
      city: cityParam,
      vibe: vibeParam,
      places: selectedPlaces,
      article,
    }

    return NextResponse.json(routeData)
  } catch (error) {
    console.error("Random route API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const city = searchParams.get("city") || "monterrey"
  const vibe = searchParams.get("vibe") || "explorar"

  return POST(
    new NextRequest(request.url, {
      method: "POST",
      body: JSON.stringify({ city, vibe }),
      headers: { "Content-Type": "application/json" },
    }),
  )
}
