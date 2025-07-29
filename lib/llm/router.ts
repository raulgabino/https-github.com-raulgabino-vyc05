import OpenAI from "openai"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function extractVibeAndCity(text: string): Promise<{ city: string; vibe: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `Extrae la ciudad y la vibra del texto del usuario. 
          Ciudades válidas: monterrey, cdmx, guadalajara, guanajuato, cdvictoria.
          Si no se especifica ciudad, usa "monterrey" por defecto.
          Para la vibra, extrae la palabra clave principal del sentimiento o ambiente que busca.
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
      return { city: "monterrey", vibe: text.toLowerCase().trim() }
    }

    try {
      const parsed = JSON.parse(content)
      return {
        city: parsed.city || "monterrey",
        vibe: parsed.vibe || text.toLowerCase().trim(),
      }
    } catch {
      return { city: "monterrey", vibe: text.toLowerCase().trim() }
    }
  } catch (error) {
    console.error("Error in extractVibeAndCity:", error)
    return { city: "monterrey", vibe: text.toLowerCase().trim() }
  }
}
