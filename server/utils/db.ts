import type { D1Database } from '@cloudflare/workers-types'
import { CF_BINDINGS } from '~/shared/constants'
import { getCloudflareEnv } from './cloudflare-env'

export function getDb(event: H3Event): D1Database {
  const db = getCloudflareEnv(event)?.[CF_BINDINGS.d1]
  if (!db) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Database unavailable. Run with wrangler or deploy to Cloudflare.',
    })
  }
  return db
}
