import { kv } from "@vercel/kv"
import { nearestSlug } from "./vector"

const TTL = 86400 // 24 hours
const N = 5 // threshold

export async function checkCooldown(slug: string, v: number[], meta: { tags: string[]; desc: string }) {
  try {
    console.log(`🕐 Checking cooldown for slug: ${slug}`)

    const key = `hits:${slug}`
    const hits = await kv.incr(key)
    console.log(`📊 Current hits for ${slug}: ${hits}`)

    if (hits === 1) {
      await kv.expire(key, TTL)
      console.log(`⏰ Set TTL for ${key}`)
    }

    if (hits >= N) {
      console.log(`🚫 Cooldown threshold reached for ${slug}, creating pending entry`)
      await kv.hset(`pending:${slug}`, {
        v: JSON.stringify(v),
        tags: JSON.stringify(meta.tags),
        desc: meta.desc,
        firstUsed: Date.now(),
      })
      await kv.del(key)
      return { status: "pending_created", slug }
    }

    // Map to nearest existing slug
    console.log(`🔍 Finding nearest slug for vector:`, v)
    const slugNearest = await nearestSlug(v)
    console.log(`✅ Nearest slug found: ${slugNearest}`)

    return { status: "alias_existing", slugNearest }
  } catch (error) {
    console.error("❌ Cooldown error:", error)
    // Fallback: allow the request
    return { status: "alias_existing", slugNearest: slug }
  }
}
