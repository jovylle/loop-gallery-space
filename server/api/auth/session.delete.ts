import { clearSessionCookie } from '~/server/utils/session-cookie'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const galleryHost = String(config.public.galleryHost || '')
  if (galleryHost) {
    clearSessionCookie(event, galleryHost)
  }
  return { ok: true }
})
