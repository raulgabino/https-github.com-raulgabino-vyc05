import { NextResponse } from "next/server"
import { extractVibeAndCity } from "@/lib/llm/router"
import { loadPlaces } from "@/lib/data/loadPlaces"
import { runMegaPrompt } from "@/lib/llm/megaprompt"
import { checkCooldown } from "@/lib/vibes/cooldown"
import vibesCatalog from "@/public/data/vibes.json"

export const runtime = "edge"

export async function POST(req: Request) {
  const { text } = await req.json()

  if (!text) return NextResponse.json({ error: "text required" }, { status: 400 })

  // 1 · mini-parse
  const parsed = await extractVibeAndCity(text)
  const { city, vibe: slugCandidate } = parsed

  // 2 · cool-down gate (vector dummy for now)
  const vectorDummy = [0, 0, 0, 0, 0, 0]
  const cd = await checkCooldown(slugCandidate, vectorDummy, { tags: [], desc: "" })
  const slug = cd.status === "alias_existing" ? cd.slugNearest : slugCandidate

  // 3 · pre-filter lugares
  const all = await loadPlaces(city)
  const candidates = all.slice(0, 15)

  // 4 · catalog slugs (top 200 por popularidad simulada)
  const vibes = Array.isArray(vibesCatalog) ? vibesCatalog : vibesCatalog.vibes || []
  const catalogSlugs = vibes.slice(0, 200).map((v) => v.id)

  // 5 · mega-prompt
  const result = await runMegaPrompt(text, candidates, catalogSlugs)

  return NextResponse.json(result)
}
