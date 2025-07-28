// Permitir que vibes.json sea un array plano o un objeto { vibes: [...] }
import { z } from "zod"

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
