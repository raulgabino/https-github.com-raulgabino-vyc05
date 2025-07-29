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
      id: z.string(),
      name: z.string(),
      category: z.string(),
      description: z.string(),
      tagline: z.string(),
      score: z.number(),
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
      city: {
        type: "string",
        description: "Ciudad seleccionada",
      },
      vibe: {
        type: "object",
        properties: {
          slug: { type: "string" },
          v: {
            type: "array",
            items: { type: "number" },
            minItems: 6,
            maxItems: 6,
          },
          isNew: { type: "boolean" },
        },
        required: ["slug", "v"],
      },
      places: {
        type: "array",
        items: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            category: { type: "string" },
            description: { type: "string" },
            tagline: { type: "string" },
            score: { type: "number" },
          },
          required: ["id", "name", "category", "description", "tagline", "score"],
        },
      },
      itinerary_html: { type: "string" },
    },
    required: ["city", "vibe", "places"],
  },
}

/** — Prompt del sistema reutilizado por runMegaPrompt — */
export const SYSTEM_PROMPT = `Eres el motor único de YourCityVibes. 

Tu trabajo es procesar una consulta de búsqueda de lugares y devolver una respuesta estructurada usando la función build_response.

Recibirás:
1. Una consulta del usuario (ej: "romanticon", "lugares para una cita")
2. Una lista de candidatos (lugares reales con datos)
3. Un catálogo de slugs de vibes disponibles

Debes:
1. Interpretar la vibra solicitada
2. Seleccionar los mejores lugares de los candidatos
3. Generar taglines atractivos para cada lugar
4. Asignar scores basados en qué tan bien coinciden con la vibra

IMPORTANTE: 
- Usa SOLO los lugares de la lista de candidatos
- Los taglines deben ser creativos y específicos para cada lugar
- Los scores deben reflejar qué tan bien coincide cada lugar con la vibra solicitada
- Si no hay candidatos, devuelve una lista vacía

Devuelve SOLO una llamada a la función build_response sin texto extra.`.trim()
