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
      name: z.string(),
      category: z.string(),
      description: z.string(),
      score: z.number(),
      tagline: z.string(),
      rank_score: z.number().optional(),
      tags: z.array(z.string()).optional(),
      coordinates: z.array(z.number()).optional(),
      rango_precios: z.string().optional(),
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
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            score: { type: "number" },
            tagline: { type: "string" },
            rank_score: { type: "number" },
            tags: { type: "array", items: { type: "string" } },
            coordinates: { type: "array", items: { type: "number" } },
            rango_precios: { type: "string" },
          },
          required: ["id", "name", "category", "description", "score", "tagline"],
        },
      },
      itinerary_html: { type: "string" },
    },
    required: ["city", "vibe", "places"],
  },
}

/** — Prompt del sistema reutilizado por runMegaPrompt — */
export const SYSTEM_PROMPT =
  `Eres el motor único de YourCityVibes. Devuelve SOLO una llamada a la función build_response sin texto extra.

Tu trabajo es:
1. Analizar la consulta del usuario para entender qué tipo de vibra busca
2. Seleccionar los mejores lugares de la lista de candidatos que coincidan con esa vibra
3. Generar taglines atractivos y personalizados para cada lugar
4. Asignar scores basados en qué tan bien cada lugar coincide con la vibra solicitada
5. Devolver la respuesta estructurada usando la función build_response

Reglas importantes:
- SIEMPRE usa los nombres reales de los lugares de la lista de candidatos
- Los taglines deben ser creativos y específicos para cada lugar
- Los scores deben estar entre 0.1 y 1.0
- Incluye toda la información disponible del lugar original
- Si no hay candidatos, devuelve una lista vacía pero mantén la estructura`.trim()
