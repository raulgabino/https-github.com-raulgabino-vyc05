import { z } from "zod"

// Existing schemas...
export const VibeSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  vector: z.array(z.number()).length(6).optional(),
})

export const PlaceSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string(),
  description: z.string().optional(),
  coordinates: z.tuple([z.number(), z.number()]).optional(),
  rating: z.number().optional(),
  tags: z.array(z.string()).optional(),
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
