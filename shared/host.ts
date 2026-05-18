import { RESERVED_USERNAMES, USERNAME_REGEX } from '~/shared/constants'

export function isAbsoluteUrl(url: string): boolean {
  return /^https?:\/\//i.test(url)
}

export function isValidPublicUsername(value: string): boolean {
  const u = value.toLowerCase()
  return USERNAME_REGEX.test(u) && !RESERVED_USERNAMES.has(u)
}

/**
 * Infer tenant + apex gallery host from a 4+ label hostname when env is unset.
 * e.g. glowzip360.loopgallery.a-u.us → { tenant: glowzip360, galleryHost: loopgallery.a-u.us }
 */
export function parseTenantGalleryHost(hostname: string): { tenant: string, galleryHost: string } | null {
  const host = hostname.split(':')[0]!.toLowerCase()
  const parts = host.split('.')
  if (parts.length < 4) return null

  const tenant = parts[0]!
  if (!isValidPublicUsername(tenant)) return null

  return { tenant, galleryHost: parts.slice(1).join('.') }
}

/** Username from `alice.loopgallery.example.com` (single label only). */
export function tenantUsernameFromHost(hostname: string, galleryHost: string): string | null {
  const host = hostname.split(':')[0]!.toLowerCase()
  const base = galleryHost.toLowerCase()
  const suffix = `.${base}`
  if (!host.endsWith(suffix)) return null

  const label = host.slice(0, -suffix.length)
  if (!label || label.includes('.')) return null
  if (!isValidPublicUsername(label)) return null
  return label
}

export function isGalleryAppHost(hostname: string, galleryHost: string): boolean {
  const host = hostname.split(':')[0]!.toLowerCase()
  return host === galleryHost.toLowerCase() || tenantUsernameFromHost(host, galleryHost) !== null
}

/** Apex or tenant subdomain of this gallery (not a third-party site). */
export function isSameGalleryAppUrl(url: string, galleryHost: string): boolean {
  if (!galleryHost || !isAbsoluteUrl(url)) return !isAbsoluteUrl(url)
  try {
    const host = new URL(url).hostname.split(':')[0]!.toLowerCase()
    return isGalleryAppHost(host, galleryHost)
  }
  catch {
    return false
  }
}

export function galleryAppUrl(galleryHost: string, siteUrl: string, path = '/'): string {
  const proto = siteUrl.startsWith('http://') ? 'http' : 'https'
  const suffix = path === '/' ? '/' : path
  return `${proto}://${galleryHost}${suffix}`
}

export function profilePublicUrl(
  username: string,
  galleryHost: string,
  siteUrl: string,
  path = '/',
): string {
  const u = username.toLowerCase()
  if (!galleryHost) {
    return path === '/' ? `/${u}` : `/${u}${path}`
  }
  const proto = siteUrl.startsWith('http://') ? 'http' : 'https'
  const suffix = path === '/' ? '' : path
  return `${proto}://${u}.${galleryHost}${suffix}`
}
