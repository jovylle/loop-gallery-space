import {
  galleryAppUrl,
  isValidPublicUsername,
  profilePublicUrl,
  tenantUsernameFromHost,
} from '~/shared/host'

const APP_PATH_PREFIXES = ['/dashboard', '/login']

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const galleryHost = String(config.public.galleryHost || '')
  if (!galleryHost) return

  const url = getRequestURL(event)
  if (url.pathname.startsWith('/api') || url.pathname.startsWith('/_')) return

  const hostname = getRequestHost(event, { xForwardedHost: true }).split(':')[0]!.toLowerCase()
  const siteUrl = String(config.public.siteUrl || 'https://localhost')
  const tenant = tenantUsernameFromHost(hostname, galleryHost)

  if (hostname === galleryHost.toLowerCase()) {
    const match = url.pathname.match(/^\/([a-z0-9_]{3,24})\/?$/)
    if (match && isValidPublicUsername(match[1]!) && !url.searchParams.has('manage')) {
      return sendRedirect(
        event,
        profilePublicUrl(match[1]!, galleryHost, siteUrl),
        301,
      )
    }
    return
  }

  if (!tenant) return

  for (const prefix of APP_PATH_PREFIXES) {
    if (url.pathname === prefix || url.pathname.startsWith(`${prefix}/`)) {
      const target = `${galleryAppUrl(galleryHost, siteUrl, url.pathname)}${url.search}`
      return sendRedirect(event, target, 302)
    }
  }

  const pathUser = url.pathname.match(/^\/([a-z0-9_]{3,24})\/?$/)
  if (pathUser) {
    if (pathUser[1] === tenant) {
      return sendRedirect(event, profilePublicUrl(tenant, galleryHost, siteUrl), 301)
    }
    throw createError({ statusCode: 404, statusMessage: 'Gallery not found' })
  }
})
