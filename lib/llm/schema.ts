import { z } from "zod"

/** — Zod schema que describe la salida esperada — */
export const BuildResponseSchema = z.object({
  city: z.string(),
  vibe: z.object({
    slug: z.string(),
    v: z.array(z.number()).length(6),
    isNew: z.boolean().optional(),
  }),
  places: z.array(
    z.object({
      id: z.number(),
      score: z.number(),
      tagline: z.string(),
    }),
  ),
  itinerary_html: z.string().optional(),
})

/** — Descriptor para function-calling — */
export const buildResponseFn = {
  name: "build_response",
  description: "Respuesta final que la UI puede renderizar",
  parameters: {
    type: "object",
    properties: {
      city: { type: "string" },
      vibe: {
        type: "object",
        properties: {
          slug: { type: "string" },
          v: { type: "array", items: { type: "number" }, minItems: 6, maxItems: 6 },
          isNew: { type: "boolean" },
        },
        required: ["slug", "v"],
      },
      places: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "number" },
            score: { type: "number" },
            tagline: { type: "string" },
          },
          required: ["id", "score", "tagline"],
        },
      },
      itinerary_html: { type: "string" },
    },
    required: ["city", "vibe", "places"],
  },
}

/** — Prompt del sistema reutilizado por runMegaPrompt — */
export const SYSTEM_PROMPT = `Eres el motor único de YourCityVibes. 

Analiza la consulta del usuario y los lugares candidatos proporcionados. 
Devuelve SOLO una llamada a la función build_response con:

1. city: La ciudad detectada
2. vibe: Un objeto con slug (la vibra detectada), vector v de 6 dimensiones, y si es nueva
3. places: Array de lugares rankeados con id, score (0-1) y tagline atractivo en español
4. itinerary_html: HTML opcional con itinerario sugerido

IMPORTANTE: 
- Usa los IDs reales de los lugares candidatos proporcionados
- Crea taglines únicos y atractivos para cada lugar
- El score debe reflejar qué tan bien coincide el lugar con la vibra
- Prioriza lugares que mejor coincidan con la vibra del usuario

Ejemplo de tagline: "El refugio perfecto para una cita romántica" o "Donde la música y las luces crean magia nocturna"`.trim()
