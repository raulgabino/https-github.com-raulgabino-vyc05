// 6 dimensiones del vector v: [Party, Chill, Culture, Romance, Outdoor, Luxe]
export const VECTOR_DIMENSIONS = {
  PARTY: 0, // Energy/Fiesta
  CHILL: 1, // Comfort/Relax
  CULTURE: 2, // Gourmet/Cultural
  ROMANCE: 3, // Intimacy/Romántico
  OUTDOOR: 4, // Adventure/Aventurero
  LUXE: 5, // Premium/Luxe
} as const

// Vectores base para categorías de lugares
export const CATEGORY_VECTORS: Record<string, number[]> = {
  Restaurante: [0.1, 0.3, 0.4, 0.2, 0.0, 0.3],
  Café: [0.0, 0.5, 0.3, 0.1, 0.1, 0.1],
  "Bar y Cantina": [0.6, 0.2, 0.1, 0.1, 0.0, 0.2],
  "Club / Antro": [0.8, 0.0, 0.0, 0.0, 0.0, 0.2],
  "Rooftop / Terraza": [0.4, 0.3, 0.1, 0.2, 0.0, 0.4],
  "Mercado & Food Truck": [0.3, 0.2, 0.4, 0.0, 0.1, 0.0],
  "Boutique / Concept Store": [0.0, 0.1, 0.3, 0.1, 0.0, 0.5],
  "Belleza & Spa": [0.0, 0.7, 0.1, 0.2, 0.0, 0.4],
  "Arte & Cultura": [0.0, 0.2, 0.6, 0.1, 0.1, 0.2],
  "Librería & Papelería": [0.0, 0.4, 0.5, 0.1, 0.0, 0.1],
  "Parque / Outdoor": [0.1, 0.3, 0.1, 0.1, 0.4, 0.0],
  "Entretenimiento & Experiencia": [0.4, 0.2, 0.3, 0.1, 0.0, 0.2],
}

// Calcular similitud coseno entre dos vectores
export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  if (vectorA.length !== vectorB.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < vectorA.length; i++) {
    dotProduct += vectorA[i] * vectorB[i]
    normA += vectorA[i] * vectorA[i]
    normB += vectorB[i] * vectorB[i]
  }

  if (normA === 0 || normB === 0) return 0

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

// Derivar vector promedio para un lugar basado en su categoría y tags
export function deriveePlaceVector(place: { category?: string; tags?: string[] }): number[] {
  const baseVector = CATEGORY_VECTORS[place.category || ""] || [0.2, 0.2, 0.2, 0.2, 0.2, 0.0]

  // Ajustar vector basado en tags específicos
  const adjustedVector = [...baseVector]

  if (place.tags) {
    place.tags.forEach((tag) => {
      const lowerTag = tag.toLowerCase()

      // Ajustes basados en tags
      if (["fiesta", "party", "baile", "dj"].some((t) => lowerTag.includes(t))) {
        adjustedVector[VECTOR_DIMENSIONS.PARTY] += 0.1
      }
      if (["relax", "chill", "tranquilo", "relajado"].some((t) => lowerTag.includes(t))) {
        adjustedVector[VECTOR_DIMENSIONS.CHILL] += 0.1
      }
      if (["gourmet", "cultural", "arte", "tradicional"].some((t) => lowerTag.includes(t))) {
        adjustedVector[VECTOR_DIMENSIONS.CULTURE] += 0.1
      }
      if (["romántico", "íntimo", "parejas", "romance"].some((t) => lowerTag.includes(t))) {
        adjustedVector[VECTOR_DIMENSIONS.ROMANCE] += 0.1
      }
      if (["outdoor", "naturaleza", "aventura", "senderismo"].some((t) => lowerTag.includes(t))) {
        adjustedVector[VECTOR_DIMENSIONS.OUTDOOR] += 0.1
      }
      if (["lujo", "exclusivo", "premium", "elegante"].some((t) => lowerTag.includes(t))) {
        adjustedVector[VECTOR_DIMENSIONS.LUXE] += 0.1
      }
    })
  }

  // Normalizar para que la suma no exceda 1
  const sum = adjustedVector.reduce((a, b) => a + b, 0)
  if (sum > 1) {
    return adjustedVector.map((v) => v / sum)
  }

  return adjustedVector
}

// Encontrar el slug más cercano basado en similitud vectorial
export async function nearestSlug(targetVector: number[]): Promise<string> {
  try {
    // Load vibes catalog
    const response = await fetch("/data/vibes.json")
    const data = await response.json()

    // Handle both array and object formats
    const vibes = Array.isArray(data) ? data : data.vibes || []

    let bestMatch = vibes[0]
    let bestSimilarity = 0

    for (const vibe of vibes) {
      if (vibe.v && Array.isArray(vibe.v)) {
        const similarity = cosineSimilarity(targetVector, vibe.v)
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity
          bestMatch = vibe
        }
      }
    }

    return bestMatch?.id || "explorar"
  } catch (error) {
    console.error("Error finding nearest slug:", error)
    return "explorar"
  }
}
