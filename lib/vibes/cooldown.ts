import { kv } from "@vercel/kv"
import { nearestSlug } from "./vector"

const TTL = 86400 // 24 h
const N = 5 // threshold

export async function checkCooldown(slug: string, v: number[], meta: { tags: string[]; desc: string }) {
  try {
    const key = `hits:${slug}`
    const hits = await kv.incr(key)

    if (hits === 1) {
      await kv.expire(key, TTL)
    }

    if (hits >= N) {
      await kv.hset(`pending:${slug}`, {
        v: JSON.stringify(v),
        tags: JSON.stringify(meta.tags),
        desc: meta.desc,
        firstUsed: Date.now(),
      })
      await kv.del(key)
      return { status: "pending_created", slug }
    }

    // map al slug existente más cercano
    const slugNearest = await nearestSlug(v)
    return { status: "alias_existing", slugNearest }
  } catch (error) {
    console.error("Error in checkCooldown:", error)
    // Fallback: return the original slug
    return { status: "alias_existing", slugNearest: slug }
  }
}
