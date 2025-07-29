import { NextResponse } from "next/server"
import { extractVibeAndCity } from "@/lib/llm/router"
import { loadPlaces } from "@/lib/data/loadPlaces"
import { runMegaPrompt } from "@/lib/llm/megaprompt"
import { checkCooldown } from "@/lib/vibes/cooldown"
import vibesCatalog from "@/public/data/vibes.json"
import type { City } from "@/lib/types"

export const runtime = "edge"

export async function POST(req: Request) {
  try {
    const { text } = await req.json()
    console.log("🔍 Query received:", text)

    if (!text) {
      return NextResponse.json({ error: "text required" }, { status: 400 })
    }

    // 1 · mini-parse
    console.log("📝 Extracting vibe and city...")
    const parsed = await extractVibeAndCity(text)
    const { city, vibe: slugCandidate } = parsed
    console.log("✅ Parsed:", { city, vibe: slugCandidate })

    // 2 · cool-down gate (vector dummy for now)
    console.log("⏰ Checking cooldown...")
    const vectorDummy = [0, 0, 0, 0, 0, 0]
    const cd = await checkCooldown(slugCandidate, vectorDummy, { tags: [], desc: "" })
    const slug = cd.status === "alias_existing" ? cd.slugNearest : slugCandidate
    console.log("✅ Cooldown result:", cd)

    // 3 · pre-filter lugares
    console.log("📍 Loading places for city:", city)
    const all = loadPlaces(city as City)
    console.log("✅ Loaded places:", all.length)

    const candidates = all.slice(0, 15)
    console.log("✅ Candidates selected:", candidates.length)

    // 4 · catalog slugs (top 200 por popularidad simulada)
    const catalogSlugs = vibesCatalog.vibes.slice(0, 200).map((v) => v.id)
    console.log("✅ Catalog slugs:", catalogSlugs.length)

    // 5 · mega-prompt
    console.log("🤖 Running mega-prompt...")
    const result = await runMegaPrompt(text, candidates, catalogSlugs)
    console.log("✅ Mega-prompt result:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ API Error:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    )
  }
}
