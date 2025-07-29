import OpenAI from "openai"
import type { City } from "@/lib/types"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function extractVibeAndCity(text: string): Promise<{ city: City; vibe: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extrae la ciudad y la vibra de la consulta del usuario. 
          
Ciudades válidas: monterrey, cdmx, guadalajara, guanajuato, cdvictoria
Si no se especifica ciudad, usa "monterrey" por defecto.

La vibra debe ser una palabra o frase corta que describa el mood/ambiente que busca.

Responde SOLO en formato JSON:
{"city": "ciudad", "vibe": "vibra"}`,
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
      return { city: "monterrey", vibe: text }
    }

    try {
      const parsed = JSON.parse(content)
      return {
        city: parsed.city || "monterrey",
        vibe: parsed.vibe || text,
      }
    } catch {
      return { city: "monterrey", vibe: text }
    }
  } catch (error) {
    console.error("Error in extractVibeAndCity:", error)
    return { city: "monterrey", vibe: text }
  }
}
