import OpenAI from "openai"
import { buildResponseFn, SYSTEM_PROMPT } from "./schema"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function runMegaPrompt(userQuery: string, candidates: any[], catalogSlugs: string[]): Promise<any> {
  try {
    console.log("🤖 Running mega-prompt with:", {
      query: userQuery,
      candidatesCount: candidates.length,
      catalogSlugsCount: catalogSlugs.length,
    })

    // If no candidates, return empty result
    if (candidates.length === 0) {
      console.log("⚠️ No candidates provided, returning empty result")
      return {
        city: "cdmx",
        vibe: { slug: userQuery, v: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5] },
        places: [],
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Consulta: "${userQuery}"

Candidatos disponibles:
${candidates.map((place, i) => `${i + 1}. ${place.name} (${place.category}) - ${place.description}`).join("\n")}

Catálogo de vibes: ${catalogSlugs.slice(0, 20).join(", ")}...`,
        },
      ],
      functions: [buildResponseFn],
      function_call: { name: "build_response" },
      temperature: 0.7,
      max_tokens: 2000,
    })

    const functionCall = response.choices[0]?.message?.function_call
    if (functionCall && functionCall.arguments) {
      const result = JSON.parse(functionCall.arguments)
      console.log("✅ Mega-prompt result:", result)
      return result
    }

    throw new Error("No function call in response")
  } catch (error) {
    console.error("❌ Mega-prompt error:", error)

    // Fallback response
    const fallbackPlaces = candidates.slice(0, 3).map((place, index) => ({
      id: place.id || `fallback-${index}`,
      name: place.name || `Lugar ${index + 1}`,
      category: place.category || "Lugar",
      description: place.description || "Un lugar interesante para visitar",
      tagline: `${place.name || `Lugar ${index + 1}`} - perfecto para tu vibra`,
      score: 0.8 - index * 0.1,
    }))

    return {
      city: "cdmx",
      vibe: {
        slug: userQuery,
        v: [0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
      },
      places: fallbackPlaces,
    }
  }
}
