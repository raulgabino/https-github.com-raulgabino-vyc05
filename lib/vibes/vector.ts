import type { Place } from "@/lib/types"

// Cosine similarity function
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

// Derive place vector from tags and description
export function deriveePlaceVector(place: Place): number[] {
  // Simple implementation - derive 6D vector from place properties
  const tags = place.tags || []
  const category = place.category || ""
  const description = place.description || ""

  // Basic vector derivation (this would be more sophisticated in production)
  const vector = [0, 0, 0, 0, 0, 0]

  // Map categories to vector dimensions
  if (category.includes("restaurant") || category.includes("comida")) vector[0] = 1
  if (category.includes("bar") || category.includes("bebida")) vector[1] = 1
  if (category.includes("cultura") || category.includes("museo")) vector[2] = 1
  if (category.includes("naturaleza") || category.includes("parque")) vector[3] = 1
  if (category.includes("compras") || category.includes("shopping")) vector[4] = 1
  if (category.includes("entretenimiento") || category.includes("diversión")) vector[5] = 1

  return vector
}

// Find nearest slug based on vector similarity
export async function nearestSlug(targetVector: number[]): Promise<string> {
  try {
    // Load vibes catalog
    const response = await fetch("/data/vibes.json")
    const data = await response.json()
    const vibes = Array.isArray(data) ? data : data.vibes || []

    let bestMatch = vibes[0]?.id || "default"
    let bestSimilarity = -1

    for (const vibe of vibes) {
      const similarity = cosineSimilarity(targetVector, vibe.v)
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity
        bestMatch = vibe.id
      }
    }

    return bestMatch
  } catch (error) {
    console.error("Error finding nearest slug:", error)
    return "default"
  }
}
