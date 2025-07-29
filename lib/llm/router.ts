import OpenAI from "openai"
import { z } from "zod"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ParsedQuerySchema = z.object({
  city: z.enum(["monterrey", "cdmx", "guadalajara", "guanajuato", "cdvictoria"]),
  vibe: z.string(),
})

export async function extractVibeAndCity(text: string): Promise<{ city: string; vibe: string }> {
  try {
    console.log("🔍 Extracting vibe and city from:", text)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un parser que extrae la ciudad y vibra de consultas de usuarios.

Ciudades disponibles: monterrey, cdmx, guadalajara, guanajuato, cdvictoria
Si no se menciona ciudad, usa "monterrey" por defecto.

Extrae la vibra principal de la consulta. Ejemplos:
- "romanticon" -> romanticon
- "lugares románticos" -> romantico
- "bares para fiesta" -> fiesta
- "cafés chill" -> chill

Responde SOLO en formato JSON: {"city": "ciudad", "vibe": "vibra"}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from OpenAI")
    }

    const parsed = JSON.parse(content)
    console.log("✅ Parsed query:", parsed)

    return {
      city: parsed.city || "monterrey",
      vibe: parsed.vibe || text,
    }
  } catch (error) {
    console.error("❌ Error parsing query:", error)
    // Fallback parsing
    const lowerText = text.toLowerCase()
    let city = "monterrey"

    if (lowerText.includes("cdmx") || lowerText.includes("mexico")) city = "cdmx"
    else if (lowerText.includes("guadalajara")) city = "guadalajara"
    else if (lowerText.includes("guanajuato")) city = "guanajuato"
    else if (lowerText.includes("victoria")) city = "cdvictoria"

    return { city, vibe: text }
  }
}
