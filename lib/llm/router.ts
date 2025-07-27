import OpenAI from "openai"
import { RouterResponseSchema, type RouterResponse } from "../schemas/llm"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required")
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ROUTER_FUNCTION = {
  name: "parse_user_query",
  description: "Parse user input to extract city, vibe and intent",
  parameters: {
    type: "object",
    properties: {
      city: {
        type: "string",
        enum: ["monterrey", "guadalajara", "cdmx", "guanajuato", "cdvictoria"],
        description: "Detected city from user input",
      },
      vibe: {
        type: "string",
        description: "User mood/vibe in 1-3 words (Spanish preferred)",
      },
      intent: {
        type: "string",
        enum: ["spot", "route"],
        description: "spot=single place, route=multiple places/route",
      },
    },
    required: ["city", "vibe", "intent"],
  },
}

export async function parseUserQuery(userInput: string): Promise<RouterResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Eres un asistente que analiza queries de usuarios mexicanos buscando lugares. Detecta la ciudad (monterrey/guadalajara/cdmx/guanajuato/cdvictoria), el vibe/mood, y si buscan un lugar (spot) o una ruta (route). Si no especifican ciudad, usa monterrey por defecto.",
        },
        {
          role: "user",
          content: userInput,
        },
      ],
      functions: [ROUTER_FUNCTION],
      function_call: { name: "parse_user_query" },
      temperature: 0.3,
      max_tokens: 100,
    })

    const functionCall = completion.choices[0]?.message?.function_call
    if (!functionCall?.arguments) {
      throw new Error("No function call returned")
    }

    const parsed = JSON.parse(functionCall.arguments)
    return RouterResponseSchema.parse(parsed)
  } catch (error) {
    console.error("Error parsing user query:", error)
    // Fallback
    return {
      city: "monterrey",
      vibe: "explorar",
      intent: "spot",
    }
  }
}
