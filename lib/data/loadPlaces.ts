import type { Place, City } from "../types"
import { cosineSimilarity, deriveePlaceVector } from "../vibes/vector"

interface Vibe {
  id: string
  v: number[]
  tags: string[]
  desc: string
}

// Cache en memoria global (Vercel Edge)
const placesCache = new Map<City, Place[]>()
const vibesCache = new Map<string, Vibe[]>()

// Normalizar lugar a formato estándar
function normalizePlace(place: any): Place {
  return {
    id: place.id?.toString() || "",
    name: place.nombre || place.name || "",
    category: place.categoría || place.category || "",
    description: place.descripción_corta || place.description || "",
    coordinates: place.coordinates || [place.lat || 0, place.lng || 0],
    rank_score: place.rank_score || place.rating || 4.0,
    tags: place.playlists || place.tags || [],
    rango_precios: place.rango_precios || "$$",
  }
}

export async function loadPlaces(city: City): Promise<Place[]> {
  console.log(`📍 Loading places for city: ${city}`)

  if (placesCache.has(city)) {
    const cached = placesCache.get(city)!
    console.log(`✅ Using cached places: ${cached.length}`)
    return cached
  }

  try {
    const fileMap: Record<City, string> = {
      monterrey: "monterrey",
      guadalajara: "guadalajara",
      cdmx: "cdmx",
      guanajuato: "guanajuato",
      cdvictoria: "cdvictoria",
    }

    const fileName = fileMap[city]
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/data/places-${fileName}.json`
    console.log(`📡 Fetching places from: ${url}`)

    const response = await fetch(url)
    if (!response.ok) {
      console.error(`❌ Failed to fetch places for ${city}: ${response.status}`)
      return []
    }

    const data = await response.json()
    console.log(`📊 Raw data structure:`, Object.keys(data))

    const rawPlaces = data.lugares || []
    console.log(`📊 Raw places count: ${rawPlaces.length}`)

    if (rawPlaces.length === 0) {
      console.warn(`⚠️ No places found in data for ${city}`)
      return []
    }

    const places: Place[] = rawPlaces.map(normalizePlace)
    console.log(`✅ Normalized places: ${places.length}`)
    console.log(`📍 Sample place:`, places[0])

    placesCache.set(city, places)
    return places
  } catch (error) {
    console.error(`❌ Error loading places for ${city}:`, error)
    return []
  }
}

export async function loadVibes(): Promise<Vibe[]> {
  if (vibesCache.has("vibes")) {
    return vibesCache.get("vibes")!
  }

  try {
    const url = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/data/vibes.json`
    const response = await fetch(url)
    if (!response.ok) {
      console.error(`Failed to fetch vibes: ${response.status}`)
      return []
    }

    const data = await response.json()
    const vibes: Vibe[] = data.vibes || []

    vibesCache.set("vibes", vibes)
    console.log(`Loaded ${vibes.length} vibes`)
    return vibes
  } catch (error) {
    console.error("Error loading vibes:", error)
    return []
  }
}

export function findVibeBySlug(vibes: Vibe[], slug: string): Vibe | undefined {
  return vibes.find((vibe) => vibe.id.toLowerCase() === slug.toLowerCase())
}

export function rankPlaces(places: Place[], vibe: Vibe, vibeSlug: string): Place[] {
  console.log(`Ranking ${places.length} places for vibe: ${vibeSlug}`)

  // Filtrado duro: place.playlists.includes(vibeSlug)
  const filtered = places.filter((place) => {
    const hasVibeInPlaylist = place.tags?.some(
      (tag) =>
        tag.toLowerCase().includes(vibeSlug.toLowerCase()) ||
        vibe.tags.some((vibeTag) => tag.toLowerCase().includes(vibeTag.toLowerCase())),
    )

    return hasVibeInPlaylist
  })

  console.log(`Filtered to ${filtered.length} places with vibe in playlists`)

  if (filtered.length === 0) {
    // Si no hay matches exactos, usar todos los lugares
    console.log("No exact matches, using all places with scoring")
    return rankAllPlaces(places, vibe)
  }

  return rankAllPlaces(filtered, vibe)
}

function rankAllPlaces(places: Place[], vibe: Vibe): Place[] {
  const scored = places.map((place) => {
    // Normalizar rating (1-5 => 0-1)
    const ratingNorm = Math.max(0, Math.min(1, ((place.rank_score || 4.0) - 1) / 4))

    // Calcular similitud coseno
    const placeVector = deriveePlaceVector({
      category: place.category,
      tags: place.tags,
    })
    const similarity = cosineSimilarity(placeVector, vibe.v)

    // Price bonus
    let priceBonus = 0
    if (place.rango_precios === "$" || place.rango_precios === "$$") {
      // Bonus para lugares accesibles cuando no es vibe de lujo
      const luxeScore = vibe.v[5] || 0 // índice 5 = Luxe
      if (luxeScore < 0.3) {
        priceBonus = 0.1
      }
    }

    // Fórmula de scoring: 0.7 * rating + 0.2 * cosine + 0.1 * priceBonus
    const score = 0.7 * ratingNorm + 0.2 * similarity + priceBonus

    console.log(
      `${place.name}: rating=${ratingNorm.toFixed(2)}, similarity=${similarity.toFixed(2)}, price=${priceBonus}, total=${score.toFixed(2)}`,
    )

    return { ...place, computed_score: score }
  })

  // Sort por score + random para empates
  const ranked = scored
    .sort((a, b) => {
      const scoreDiff = (b.computed_score || 0) - (a.computed_score || 0)
      if (Math.abs(scoreDiff) < 0.01) {
        return Math.random() - 0.5 // Random para empates
      }
      return scoreDiff
    })
    .map(({ computed_score, ...place }) => place)

  console.log(
    "Top 5 ranked places:",
    ranked.slice(0, 5).map((p) => p.name),
  )

  return ranked
}

export function getRandomPlaces(places: Place[], count = 3): Place[] {
  const shuffled = [...places].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}
