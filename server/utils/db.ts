import type { D1Database } from '@cloudflare/workers-types'

export function getDb(event: H3Event): D1Database {
  const env = (event.context as { cloudflare?: { env?: { DB?: D1Database } } }).cloudflare?.env
  const db = env?.DB
  if (!db) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database unavailable. Run with wrangler or deploy to Cloudflare.',
    })
  }
  return db
}
