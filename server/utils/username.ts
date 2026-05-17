import type { D1Database } from '@cloudflare/workers-types'
import { RESERVED_USERNAMES, USERNAME_REGEX } from '~/shared/constants'

const PARTS_A = ['pixel', 'loop', 'mood', 'soft', 'neon', 'glow', 'arc', 'byte', 'haze', 'vibe']
const PARTS_B = ['cat', 'fox', 'owl', 'bay', 'kit', 'ray', 'zip', 'orb', 'jam', 'pop']

export function dicebearThumbsUrl(seed: string, size = 256): string {
  return `https://api.dicebear.com/9.x/thumbs/png?seed=${encodeURIComponent(seed)}&size=${size}`
}

function randomSlug(): string {
  const a = PARTS_A[Math.floor(Math.random() * PARTS_A.length)]!
  const b = PARTS_B[Math.floor(Math.random() * PARTS_B.length)]!
  const n = Math.floor(Math.random() * 9000) + 100
  return `${a}${b}${n}`
}

export async function generateUniqueUsername(db: D1Database): Promise<string> {
  for (let i = 0; i < 24; i++) {
    const candidate = randomSlug()
    if (!USERNAME_REGEX.test(candidate) || RESERVED_USERNAMES.has(candidate)) continue

    const taken = await db
      .prepare('SELECT id FROM users WHERE username = ?')
      .bind(candidate)
      .first()

    if (!taken) return candidate
  }

  throw createError({ statusCode: 500, statusMessage: 'Could not generate username' })
}
