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
    console.log("🔍 Query API received:", { text })

    if (!text) {
      return NextResponse.json({ error: "text required" }, { status: 400 })
    }

    // 1 · mini-parse
    console.log("1️⃣ Extracting vibe and city...")
    const parsed = await extractVibeAndCity(text)
    console.log("✅ Parsed:", parsed)
    const { city, vibe: slugCandidate } = parsed

    // 2 · cool-down gate (vector dummy for now)
    console.log("2️⃣ Checking cooldown...")
    const vectorDummy = [0, 0, 0, 0, 0, 0]
    const cd = await checkCooldown(slugCandidate, vectorDummy, { tags: [], desc: "" })
    console.log("✅ Cooldown result:", cd)
    const slug = cd.status === "alias_existing" ? cd.slugNearest : slugCandidate

    // 3 · pre-filter lugares
    console.log("3️⃣ Loading places for city:", city)
    const all = loadPlaces(city as City)
    console.log("✅ Loaded places:", all.length)

    if (all.length === 0) {
      console.warn("⚠️ No places loaded, returning empty result")
      return NextResponse.json({
        city,
        vibe: { slug, v: [0.2, 0.2, 0.2, 0.2, 0.2, 0.0], isNew: false },
        places: [],
        itinerary_html: "<p>No se encontraron lugares para esta ciudad</p>",
      })
    }

    const candidates = all.slice(0, 15)
    console.log("✅ Candidates selected:", candidates.length)
    console.log(
      "📍 Sample candidates:",
      candidates.slice(0, 2).map((c) => ({ name: c.name, category: c.category })),
    )

    // 4 · catalog slugs (top 200 por popularidad simulada)
    console.log("4️⃣ Loading vibes catalog...")
    const vibes = Array.isArray(vibesCatalog) ? vibesCatalog : vibesCatalog.vibes || []
    const catalogSlugs = vibes.slice(0, 200).map((v) => v.id)
    console.log("✅ Catalog slugs:", catalogSlugs.length)

    // 5 · mega-prompt
    console.log("5️⃣ Running mega-prompt...")
    const result = await runMegaPrompt(text, candidates, catalogSlugs)
    console.log("✅ Final result:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Query API Error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
