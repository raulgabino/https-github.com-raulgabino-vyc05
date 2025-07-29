import { z } from "zod"

// Existing schema content...
export const VibeSchema = z.object({
  id: z.string(),
  v: z.array(z.number()).length(6),
  tags: z.array(z.string()).optional(),
  desc: z.string().optional(),
})

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string(),
  coordinates: z.array(z.number()).length(2),
  rank_score: z.number(),
  tags: z.array(z.string()),
  rango_precios: z.string(),
})

// Permitir que vibes.json sea un array plano o un objeto { vibes: [...] }
export const VibesCatalogSchema = z.union([
  z.array(
    z.object({
      id: z.string(),
      v: z.array(z.number()).length(6),
      tags: z.array(z.string()).optional(),
      desc: z.string().optional(),
    }),
  ),
  z.object({
    vibes: z.array(
      z.object({
        id: z.string(),
        v: z.array(z.number()).length(6),
        tags: z.array(z.string()).optional(),
        desc: z.string().optional(),
      }),
    ),
  }),
])
