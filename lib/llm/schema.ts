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
  parameters: BuildResponseSchema,
}

/** — Prompt del sistema reutilizado por runMegaPrompt — */
export const SYSTEM_PROMPT =
  `Eres el motor único de YourCityVibes. Devuelve SOLO una llamada a la función build_response sin texto extra.`.trim()
