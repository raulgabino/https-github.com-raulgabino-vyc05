import type { VibeConfig } from "./schema"

// Mapeo de vibes de UI a vibes del JSON
export const VIBE_MAPPING: Record<string, string[]> = {
  relax: ["zen_minimal", "cosmic_siesta", "lluvia_lofi", "biblioteca_oculta"],
  fiesta: ["chaos_fiesta", "hyperpop_rave", "night_market", "retro_arcade"],
  aventura: ["desert_wave", "glitch_garden", "speedrun_cafe"],
  cultura: ["neo_bolero", "barrio_craft", "night_market"],
  romántico: ["romanticon", "neo_bolero", "cosmic_siesta"],
  casual: ["playa_chill", "barrio_craft", "lluvia_lofi"],
  exclusivo: ["cyber_underground", "hyperpop_rave"],
  tradicional: ["neo_bolero", "barrio_craft"],
  moderno: ["cyber_underground", "glitch_garden", "retro_arcade"],
}

// Mapeo de categorías a factores de peso
const CATEGORY_WEIGHTS: Record<string, number> = {
  Restaurante: 0.9,
  Café: 0.8,
  "Bar y Cantina": 0.7,
  "Club / Antro": 0.6,
  "Rooftop / Terraza": 0.8,
  "Mercado & Food Truck": 0.6,
  "Boutique / Concept Store": 0.5,
  "Belleza & Spa": 0.7,
  "Arte & Cultura": 0.8,
  "Librería & Papelería": 0.6,
  "Parque / Outdoor": 0.9,
  "Entretenimiento & Experiencia": 0.8,
}

export function adaptVibesData(vibesData: any): Record<string, VibeConfig> {
  const adapted: Record<string, VibeConfig> = {}

  // Convertir cada vibe del JSON al formato esperado
  if (vibesData.vibes && Array.isArray(vibesData.vibes)) {
    vibesData.vibes.forEach((vibe: any) => {
      adapted[vibe.id] = {
        keywords: vibe.tags || [],
        prompt_context: vibe.desc || "",
        weight_factors: CATEGORY_WEIGHTS,
      }
    })
  }

  return adapted
}

export function getVibeConfigForQuery(query: string, adaptedVibes: Record<string, VibeConfig>): VibeConfig | undefined {
  // Buscar en el mapeo
  for (const [uiVibe, jsonVibes] of Object.entries(VIBE_MAPPING)) {
    if (query.toLowerCase().includes(uiVibe.toLowerCase())) {
      // Combinar configuraciones de múltiples vibes
      const combinedKeywords: string[] = []
      let combinedContext = ""

      jsonVibes.forEach((vibeId) => {
        const config = adaptedVibes[vibeId]
        if (config) {
          combinedKeywords.push(...config.keywords)
          combinedContext += config.prompt_context + " "
        }
      })

      return {
        keywords: [...new Set(combinedKeywords)], // Remove duplicates
        prompt_context: combinedContext.trim(),
        weight_factors: CATEGORY_WEIGHTS,
      }
    }
  }

  // Fallback: buscar directamente en los vibes del JSON
  const directMatch = Object.values(adaptedVibes).find((vibe) =>
    vibe.keywords.some((keyword) => query.toLowerCase().includes(keyword.toLowerCase())),
  )

  return directMatch
}
