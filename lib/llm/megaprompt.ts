import OpenAI from "openai"
import { buildResponseFn, SYSTEM_PROMPT } from "./schema"

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      functions: [buildResponseFn],
      function_call: { name: "build_response" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Consulta del usuario: "${userQuery}"

Candidatos disponibles:
${candidates
  .map(
    (c, i) =>
      `${i + 1}. ${c.name} (${c.category}) - ${c.description} - Rating: ${c.rank_score} - Tags: ${c.tags?.join(", ") || "N/A"}`,
  )
  .join("\n")}

Vibes disponibles en el catálogo: ${catalogSlugs.slice(0, 20).join(", ")}...

Selecciona los mejores lugares que coincidan con la vibra "${userQuery}" y genera taglines creativos.`,
        },
      ],
      temperature: 0.7,
    })

    const functionCall = response.choices[0]?.message?.function_call
    if (!functionCall || !functionCall.arguments) {
      throw new Error("No function call received from OpenAI")
    }

    const result = JSON.parse(functionCall.arguments)
    console.log("✅ Megaprompt result:", result)

    return result
  } catch (error) {
    console.error("❌ Error in runMegaPrompt:", error)

    // Fallback response
    return {
      city: "monterrey",
      vibe: { slug: userQuery, v: [0.2, 0.2, 0.2, 0.2, 0.2, 0.0], isNew: false },
      places: candidates.slice(0, 3).map((place, index) => ({
        id: Number.parseInt(place.id) || index + 1,
        name: place.name,
        category: place.category,
        description: place.description,
        score: 0.8,
        tagline: `${place.name} es perfecto para tu vibra ${userQuery}`,
        rank_score: place.rank_score,
        tags: place.tags,
        coordinates: place.coordinates,
        rango_precios: place.rango_precios,
      })),
      itinerary_html: `<p>Lugares recomendados para la vibra "${userQuery}"</p>`,
    }
  }
}
