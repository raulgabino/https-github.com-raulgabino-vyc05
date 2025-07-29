import { z } from "zod"

export const VibeConfigSchema = z.object({
  keywords: z.array(z.string()),
  prompt_context: z.string(),
  weight_factors: z.record(z.string(), z.number()),
})

export const VibesDictionarySchema = z.record(z.string(), VibeConfigSchema)

export type VibeConfig = z.infer<typeof VibeConfigSchema>
export type VibesDictionary = z.infer<typeof VibesDictionarySchema>

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
