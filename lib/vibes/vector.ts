// Vector operations for 6D vibe space
// Dimensions: [Chill, Energy, Social, Adventure, Culture, Luxe]

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
  // Initialize 6D vector [Chill, Energy, Social, Adventure, Culture, Luxe]
  const vector = [0.2, 0.2, 0.2, 0.2, 0.2, 0.2] // Base values

  // Category-based scoring
  const category = place.category.toLowerCase()
  if (category.includes("restaurante") || category.includes("café")) {
    vector[0] += 0.3 // Chill
    vector[2] += 0.2 // Social
  }
  if (category.includes("bar") || category.includes("club")) {
    vector[1] += 0.4 // Energy
    vector[2] += 0.4 // Social
  }
  if (category.includes("museo") || category.includes("galería")) {
    vector[0] += 0.2 // Chill
    vector[4] += 0.5 // Culture
  }
  if (category.includes("parque") || category.includes("naturaleza")) {
    vector[0] += 0.4 // Chill
    vector[3] += 0.3 // Adventure
  }

  // Tag-based scoring
  place.tags.forEach((tag) => {
    const tagLower = tag.toLowerCase()
    if (tagLower.includes("relax") || tagLower.includes("zen")) {
      vector[0] += 0.3
    }
    if (tagLower.includes("fiesta") || tagLower.includes("party")) {
      vector[1] += 0.4
      vector[2] += 0.3
    }
    if (tagLower.includes("romántico") || tagLower.includes("romantic")) {
      vector[0] += 0.2
      vector[2] += 0.2
    }
    if (tagLower.includes("aventura") || tagLower.includes("adventure")) {
      vector[3] += 0.4
    }
    if (tagLower.includes("cultural") || tagLower.includes("arte")) {
      vector[4] += 0.4
    }
    if (tagLower.includes("lujo") || tagLower.includes("luxury")) {
      vector[5] += 0.4
    }
  })

  // Normalize to [0, 1] range
  return vector.map((v) => Math.min(1, Math.max(0, v)))
}

export async function nearestSlug(vector: number[]): Promise<string> {
  try {
    // Load vibes data
    const response = await fetch("/data/vibes.json")
    if (!response.ok) return "general"

    const data = await response.json()
    const vibes = data.vibes || []

    if (vibes.length === 0) return "general"

    // Find most similar vibe
    let bestMatch = vibes[0]
    let bestSimilarity = cosineSimilarity(vector, vibes[0].v)

    for (const vibe of vibes) {
      const similarity = cosineSimilarity(vector, vibe.v)
      if (similarity > bestSimilarity) {
        bestSimilarity = similarity
        bestMatch = vibe
      }
    }

    return bestMatch.id
  } catch (error) {
    console.error("Error finding nearest slug:", error)
    return "general"
  }
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
