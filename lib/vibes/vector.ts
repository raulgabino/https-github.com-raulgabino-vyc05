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
  // Simple vector derivation based on place properties
  // This is a placeholder implementation
  const tags = place.tags || []
  const category = place.category || ""
  const description = place.description || ""

  // Create a 6D vector based on place characteristics
  return [
    tags.length > 0 ? 1 : 0,
    category.includes("restaurant") ? 1 : 0,
    category.includes("bar") ? 1 : 0,
    description.length > 50 ? 1 : 0,
    place.rating || 0 > 4 ? 1 : 0,
    Math.random(), // Random component for diversity
  ]
}

// Find nearest slug based on vector similarity
export async function nearestSlug(vector: number[]): Promise<string> {
  try {
    // Load vibes catalog
    const response = await fetch("/data/vibes.json")
    if (!response.ok) return "default"

    const data = await response.json()
    const vibes = Array.isArray(data) ? data : data.vibes || []

    let bestMatch = "default"
    let bestSimilarity = -1

    for (const vibe of vibes) {
      if (vibe.v && Array.isArray(vibe.v)) {
        const similarity = cosineSimilarity(vector, vibe.v)
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity
          bestMatch = vibe.id
        }
      }
    }

    return bestMatch
  } catch (error) {
    console.error("Error finding nearest slug:", error)
    return "default"
  }
}
