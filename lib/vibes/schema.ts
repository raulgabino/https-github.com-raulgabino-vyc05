import { z } from "zod"

export const VibeConfigSchema = z.object({
  keywords: z.array(z.string()),
  prompt_context: z.string(),
  weight_factors: z.record(z.string(), z.number()),
})

export const VibesDictionarySchema = z.record(z.string(), VibeConfigSchema)

export type VibeConfig = z.infer<typeof VibeConfigSchema>
export type VibesDictionary = z.infer<typeof VibesDictionarySchema>
