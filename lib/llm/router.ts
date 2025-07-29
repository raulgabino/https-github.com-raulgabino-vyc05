import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function extractVibeAndCity(text: string): Promise<{ city: string; vibe: string }> {
  try {
    console.log("🤖 Extracting vibe and city from:", text)

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Eres un parser que extrae la ciudad y vibra de una consulta.

Ciudades disponibles: monterrey, cdmx, guadalajara, guanajuato, cdvictoria
Ciudad por defecto: cdmx

Responde SOLO en formato JSON:
{"city": "ciudad", "vibe": "vibra_extraida"}

Ejemplos:
- "romanticon" → {"city": "cdmx", "vibe": "romanticon"}
- "lugares para una cita en monterrey" → {"city": "monterrey", "vibe": "romantico"}
- "aesthetic cafes" → {"city": "cdmx", "vibe": "aesthetic"}`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.1,
      max_tokens: 100,
    })

    const content = response.choices[0]?.message?.content?.trim()
    console.log("🤖 Router response:", content)

    if (content) {
      try {
        const parsed = JSON.parse(content)
        console.log("✅ Parsed result:", parsed)
        return {
          city: parsed.city || "cdmx",
          vibe: parsed.vibe || text,
        }
      } catch (parseError) {
        console.error("❌ JSON parse error:", parseError)
      }
    }

    // Fallback
    return {
      city: "cdmx",
      vibe: text,
    }
  } catch (error) {
    console.error("❌ Router error:", error)
    return {
      city: "cdmx",
      vibe: text,
    }
  }
}
