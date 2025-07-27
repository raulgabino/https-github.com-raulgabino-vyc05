export interface Place {
  id: string | number
  nombre?: string
  name?: string
  categoría?: string
  category?: string
  descripción_corta?: string
  description?: string
  coordinates?: [number, number]
  lat?: number
  lng?: number
  rank_score?: number
  rating?: number
  playlists?: string[]
  tags?: string[]
  image_url?: string
  photoRef?: string
  rango_precios?: string
}

export interface RouteData {
  places: Place[]
  slug: string
  vibe: string
  article?: {
    title: string
    content: string
  }
}

export type Intent = "spot" | "route"
export type City = "monterrey" | "guadalajara" | "cdmx" | "guanajuato" | "cdvictoria"

export interface Vibe {
  id: string
  v: number[] // Vector de 6 dimensiones
  tags: string[]
  desc: string
}
