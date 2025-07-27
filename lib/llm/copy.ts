import OpenAI from "openai"
import { ArticleResponseSchema, TaglineResponseSchema } from "../schemas/llm"
import type { Place } from "../types"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

async function generateCopy(prompt: string, schema: any) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un experto en marketing digital y creas copys atractivos.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    return schema.parse(content)
  } catch (error) {
    console.error("Error generating copy:", error)
    return "" // Provide a default value or handle the error as needed
  }
}

export async function generateTagline(place: Place, vibe: string): Promise<string> {
  const prompt = `Genera un tagline corto (3-12 palabras) para un lugar llamado ${place.name} con el vibe de ${vibe}.`
  return generateCopy(prompt, TaglineResponseSchema)
}

export async function generateArticle(places: Place[], vibe: string) {
  const placeNames = places.map((p) => p.name).join(", ")
  const prompt = `Genera un artículo corto (200-300 palabras) sobre una ruta de viaje con los siguientes lugares: ${placeNames}. El vibe general de la ruta es ${vibe}. Incluye un título atractivo (10-80 palabras).`

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Eres un redactor de articulos de viajes.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 450,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error("No content returned from OpenAI")
    }

    // Split the content into title and content based on a simple heuristic
    const lines = content.split("\n")
    const title = lines[0].replace(/^#\s*/, "") // Remove markdown heading if present
    const articleContent = lines.slice(1).join("\n").trim()

    return ArticleResponseSchema.parse({ title: title, content: articleContent })
  } catch (error) {
    console.error("Error generating article:", error)
    return { title: "Error", content: "Error generating article" }
  }
}
