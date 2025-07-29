import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export interface ParsedQuery {
  city: string
  vibe: string
  intent: "spot" | "route" | "unknown"
}

export async function extractVibeAndCity(text: string): Promise<ParsedQuery> {
  try {
    const { text: result } = await generateText({
      model: openai("gpt-4o-mini"),
      system: `Extract city and vibe from user query. Return JSON with format: {"city": "monterrey|cdmx|guadalajara|guanajuato|cdvictoria", "vibe": "extracted_vibe", "intent": "spot|route|unknown"}. Default city to "monterrey" if not specified.`,
      prompt: text,
      temperature: 0.1,
    })

    const parsed = JSON.parse(result)
    return {
      city: parsed.city || "monterrey",
      vibe: parsed.vibe || text.toLowerCase().trim(),
      intent: parsed.intent || "spot",
    }
  } catch (error) {
    console.error("Error parsing query:", error)
    return {
      city: "monterrey",
      vibe: text.toLowerCase().trim(),
      intent: "spot",
    }
  }
}
