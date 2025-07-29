import OpenAI from "openai"
import { buildResponseFn, SYSTEM_PROMPT } from "./schema"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function runMegaPrompt(userQuery: string, candidates: any[], catalogSlugs: string[]) {
  try {
    console.log("🤖 Running megaprompt with:", {
      userQuery,
      candidatesCount: candidates.length,
      catalogSlugsCount: catalogSlugs.length,
    })

    // Log first few candidates to see what we're working with
    console.log(
      "📍 Sample candidates:",
      candidates.slice(0, 3).map((c) => ({
        id: c.id,
        name: c.name || c.nombre,
        category: c.category || c.categoría,
      })),
    )

    if (candidates.length === 0) {
      console.warn("⚠️ No candidates provided to megaprompt")
      return {
        city: "monterrey",
        vibe: { slug: "explorar", v: [0.2, 0.2, 0.2, 0.2, 0.2, 0.0], isNew: false },
        places: [],
        itinerary_html: "<p>No se encontraron lugares para esta búsqueda</p>",
      }
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Consulta del usuario: "${userQuery}"
          
Lugares candidatos disponibles:
${candidates.map((c, i) => `${i + 1}. ${c.name || c.nombre} - ${c.category || c.categoría} (ID: ${c.id})`).join("\n")}

Vibras disponibles en el catálogo: ${catalogSlugs.slice(0, 20).join(", ")}...

Analiza la consulta y devuelve los mejores lugares con sus taglines atractivos.`,
        },
      ],
      functions: [buildResponseFn],
      function_call: { name: "build_response" },
      temperature: 0.7,
    })

    const functionCall = response.choices[0]?.message?.function_call
    if (!functionCall || !functionCall.arguments) {
      throw new Error("No function call response received")
    }

    const result = JSON.parse(functionCall.arguments)
    console.log("✅ Megaprompt result:", result)

    // Validate that we have real places
    if (result.places && result.places.length > 0) {
      console.log(
        "🎯 Generated places:",
        result.places.map((p) => ({ id: p.id, tagline: p.tagline })),
      )
    }

    return result
  } catch (error) {
    console.error("❌ Error in runMegaPrompt:", error)

    // Improved fallback response with real candidate data
    const fallbackPlaces = candidates.slice(0, 3).map((place, index) => ({
      id: Number.parseInt(place.id) || index + 1,
      score: 0.8 - index * 0.1,
      tagline: `${place.name || place.nombre} - ${place.category || place.categoría}`,
    }))

    return {
      city: "monterrey",
      vibe: { slug: "explorar", v: [0.2, 0.2, 0.2, 0.2, 0.2, 0.0], isNew: false },
      places: fallbackPlaces,
      itinerary_html: "<p>Explora estos lugares increíbles</p>",
    }
  }
}
