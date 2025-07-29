import { z } from "zod"

// Schema para un lugar individual
export const PlaceSchema = z.object({
  id: z.string(),
  nombre: z.string().optional(),
  name: z.string().optional(),
  categoría: z.string().optional(),
  category: z.string().optional(),
  descripción_corta: z.string().optional(),
  description: z.string().optional(),
  playlists: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  rating: z.number().optional(),
  rank_score: z.number().optional(),
  rango_precios: z.string().optional(),
  coordinates: z.array(z.number()).optional(),
})

// Schema para el archivo de lugares
export const PlacesFileSchema = z.object({
  lugares: z.array(PlaceSchema),
})

// Schema para una vibra individual
export const VibeSchema = z.object({
  id: z.string(),
  v: z.array(z.number()).length(6),
  tags: z.array(z.string()).optional(),
  desc: z.string().optional(),
})

// Permitir que vibes.json sea un array plano o un objeto { vibes: [...] }
export const VibesCatalogSchema = z.union([
  z.array(VibeSchema),
  z.object({
    vibes: z.array(VibeSchema),
  }),
])

export type Place = z.infer<typeof PlaceSchema>
export type Vibe = z.infer<typeof VibeSchema>
export type PlacesFile = z.infer<typeof PlacesFileSchema>
export type VibesCatalog = z.infer<typeof VibesCatalogSchema>
