// Vector operations for 6D vibe space
// Dimensions: [Chill, Energy, Social, Aesthetic, Cultural, Luxe]

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) return 0

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  if (normA === 0 || normB === 0) return 0

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

export function deriveePlaceVector(place: { category: string; tags: string[] }): number[] {
  // Initialize 6D vector [Chill, Energy, Social, Aesthetic, Cultural, Luxe]
  const vector = [0, 0, 0, 0, 0, 0]

  // Category-based scoring
  const categoryMap: Record<string, number[]> = {
    Café: [0.8, 0.2, 0.4, 0.6, 0.3, 0.2],
    Restaurante: [0.4, 0.5, 0.7, 0.5, 0.4, 0.6],
    Bar: [0.3, 0.8, 0.9, 0.4, 0.3, 0.4],
    "Espacio Cultural": [0.6, 0.3, 0.5, 0.8, 0.9, 0.3],
    Boutique: [0.5, 0.4, 0.3, 0.9, 0.5, 0.7],
    Spa: [0.9, 0.1, 0.2, 0.7, 0.2, 0.8],
  }

  const categoryVector = categoryMap[place.category] || [0.5, 0.5, 0.5, 0.5, 0.5, 0.5]

  // Add category influence
  for (let i = 0; i < 6; i++) {
    vector[i] += categoryVector[i] * 0.6
  }

  // Tag-based adjustments
  const tagInfluence: Record<string, number[]> = {
    romanticón: [0.7, 0.2, 0.8, 0.8, 0.3, 0.7],
    aesthetic: [0.4, 0.3, 0.4, 1.0, 0.6, 0.6],
    barbón: [0.3, 0.6, 0.8, 0.5, 0.4, 0.5],
    traca: [0.1, 1.0, 1.0, 0.3, 0.2, 0.3],
    cultural: [0.6, 0.4, 0.5, 0.7, 1.0, 0.4],
    gourmet: [0.5, 0.3, 0.6, 0.8, 0.7, 0.9],
    tranqui: [1.0, 0.1, 0.3, 0.6, 0.4, 0.4],
    familiar: [0.8, 0.4, 0.7, 0.4, 0.5, 0.3],
  }

  // Apply tag influences
  place.tags.forEach((tag) => {
    const influence = tagInfluence[tag.toLowerCase()]
    if (influence) {
      for (let i = 0; i < 6; i++) {
        vector[i] += influence[i] * 0.4
      }
    }
  })

  // Normalize to [0, 1] range
  return vector.map((v) => Math.max(0, Math.min(1, v)))
}

export async function nearestSlug(vector: number[]): Promise<string> {
  try {
    // Import vibes data
    const vibesData = await import("@/public/data/vibes.json")
    const vibes = vibesData.vibes || []

    let bestMatch = "aesthetic" // fallback
    let bestSimilarity = -1

    vibes.forEach((vibe: any) => {
      if (vibe.v && Array.isArray(vibe.v)) {
        const similarity = cosineSimilarity(vector, vibe.v)
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity
          bestMatch = vibe.id
        }
      }
    })

    console.log(`🎯 Nearest slug for vector ${vector}: ${bestMatch} (similarity: ${bestSimilarity.toFixed(3)})`)
    return bestMatch
  } catch (error) {
    console.error("Error finding nearest slug:", error)
    return "aesthetic" // fallback
  }
}

export function createVibeVector(
  chill: number,
  energy: number,
  social: number,
  aesthetic: number,
  cultural: number,
  luxe: number,
): number[] {
  return [chill, energy, social, aesthetic, cultural, luxe].map((v) => Math.max(0, Math.min(1, v)))
}

export function euclideanDistance(a: number[], b: number[]): number {
  if (a.length !== b.length) return Number.POSITIVE_INFINITY

  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += Math.pow(a[i] - b[i], 2)
  }

  return Math.sqrt(sum)
}

export function normalizeVector(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0))
  if (magnitude === 0) return vector
  return vector.map((val) => val / magnitude)
}
