import { getMediaBucket } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  const keyParam = getRouterParam(event, 'key')
  if (!keyParam) {
    throw createError({ statusCode: 400, statusMessage: 'Key required' })
  }
  const key = decodeURIComponent(keyParam)

  const bucket = getMediaBucket(event)
  const object = await bucket.get(key)
  if (!object) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }

  const headers = new Headers()
  object.writeHttpMetadata(headers)
  headers.set('etag', object.httpEtag)
  headers.set('cache-control', 'public, max-age=31536000, immutable')

  return new Response(object.body, { headers })
})
