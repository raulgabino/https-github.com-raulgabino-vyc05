import { z } from "zod"

// Router LLM Response Schema
export const RouterResponseSchema = z.object({
  city: z.enum(["monterrey", "guadalajara", "cdmx", "guanajuato", "cdvictoria"]),
  vibe: z.string().min(1).max(50),
  intent: z.enum(["spot", "route"]),
})

export type RouterResponse = z.infer<typeof RouterResponseSchema>

// Article LLM Response Schema
export const ArticleResponseSchema = z.object({
  title: z.string().min(10).max(80),
  content: z.string().min(200).max(300),
})

export type ArticleResponse = z.infer<typeof ArticleResponseSchema>

// Tagline Response (string directo)
export const TaglineResponseSchema = z.string().min(3).max(12)

export type TaglineResponse = z.infer<typeof TaglineResponseSchema>
