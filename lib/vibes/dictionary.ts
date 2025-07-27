import type { VibeConfig } from "./schema"

// Diccionario base de vibes - se complementa con vibes.json
export const baseVibesDictionary: Record<string, VibeConfig> = {
  relax: {
    keywords: ["tranquilo", "relajado", "chill", "cafe", "parque"],
    prompt_context: "Un lugar tranquilo y relajante para desestresarse",
    weight_factors: {
      cafe: 0.9,
      parque: 0.8,
      spa: 0.9,
      biblioteca: 0.7,
      restaurant: 0.6,
    },
  },
  fiesta: {
    keywords: ["fiesta", "party", "bar", "club", "musica", "baile"],
    prompt_context: "Un lugar para divertirse y salir de fiesta",
    weight_factors: {
      bar: 0.9,
      club: 1.0,
      restaurant: 0.7,
      terraza: 0.8,
      antro: 0.9,
    },
  },
  aventura: {
    keywords: ["aventura", "outdoor", "naturaleza", "cerro", "hiking"],
    prompt_context: "Un lugar para aventurarse y explorar",
    weight_factors: {
      cerro: 0.9,
      parque: 0.8,
      trail: 0.9,
      mirador: 0.8,
      outdoor: 0.9,
    },
  },
  cultura: {
    keywords: ["arte", "museo", "historia", "cultura", "galeria"],
    prompt_context: "Un lugar cultural e interesante para aprender",
    weight_factors: {
      museo: 0.9,
      galeria: 0.8,
      teatro: 0.8,
      centro_historico: 0.9,
      biblioteca: 0.7,
    },
  },
}
