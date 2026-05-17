import { getMediaBucket } from '~/server/utils/r2'
import { verifyFirebaseToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  await verifyFirebaseToken(event)
  const query = getQuery(event)
  const key = query.key as string
  if (!key) {
    throw createError({ statusCode: 400, statusMessage: 'key required' })
  }

  const body = await readRawBody(event, false)
  if (!body) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const bucket = getMediaBucket(event)
  const contentType = getHeader(event, 'content-type') || 'application/octet-stream'
  await bucket.put(key, body, {
    httpMetadata: { contentType },
  })

  return { ok: true, key }
})
