import { verifyFirebaseIdToken, bearerTokenFromEvent } from '~/server/utils/auth'
import { setSessionCookie } from '~/server/utils/session-cookie'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const galleryHost = String(config.public.galleryHost || '')
  if (!galleryHost) {
    return { ok: false }
  }

  const token = bearerTokenFromEvent(event)
  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Missing authorization token' })
  }

  await verifyFirebaseIdToken(token)
  setSessionCookie(event, token, galleryHost)
  return { ok: true }
})
