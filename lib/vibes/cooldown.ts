// Simple cooldown implementation without KV for now
// This can be enhanced later with actual Vercel KV

const cooldownMap = new Map<string, { count: number; timestamp: number }>()
const TTL = 86400000 // 24 hours in milliseconds
const N = 5 // threshold

export async function checkCooldown(
  slug: string,
  v: number[],
  meta: { tags: string[]; desc: string },
): Promise<{ status: string; slug?: string; slugNearest?: string }> {
  try {
    console.log("⏰ Checking cooldown for slug:", slug)

    const now = Date.now()
    const key = `hits:${slug}`
    const existing = cooldownMap.get(key)

    // Clean expired entries
    if (existing && now - existing.timestamp > TTL) {
      cooldownMap.delete(key)
    }

    const current = cooldownMap.get(key) || { count: 0, timestamp: now }
    current.count += 1
    current.timestamp = now
    cooldownMap.set(key, current)

    console.log(`⏰ Cooldown status: ${current.count}/${N} hits`)

    if (current.count >= N) {
      console.log("🔄 Cooldown threshold reached, creating pending...")
      cooldownMap.delete(key) // Reset counter
      return { status: "pending_created", slug }
    }

    // For now, always return alias_existing to use the original slug
    // In a real implementation, this would call nearestSlug(v)
    return { status: "alias_existing", slugNearest: slug }
  } catch (error) {
    console.error("❌ Cooldown error:", error)
    return { status: "alias_existing", slugNearest: slug }
  }
}
