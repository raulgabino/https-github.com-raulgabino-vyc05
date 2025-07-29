import OpenAI from "openai"

const openai = new OpenAI()

export async function extractVibeAndCity(text: string): Promise<{ city: string; vibe: string }> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract the city and vibe from the user's text. Return JSON with 'city' and 'vibe' fields. Default city is 'monterrey'.",
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
    console.error("Error extracting vibe and city:", error)
    return { city: "monterrey", vibe: text.toLowerCase().trim() }
  }
}
