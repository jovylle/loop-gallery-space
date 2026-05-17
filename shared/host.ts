import { RESERVED_USERNAMES, USERNAME_REGEX } from '~/shared/constants'

export function isValidPublicUsername(value: string): boolean {
  const u = value.toLowerCase()
  return USERNAME_REGEX.test(u) && !RESERVED_USERNAMES.has(u)
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

export function galleryAppUrl(galleryHost: string, siteUrl: string, path = '/'): string {
  const proto = siteUrl.startsWith('http://') ? 'http' : 'https'
  const suffix = path === '/' ? '/' : path
  return `${proto}://${galleryHost}${suffix}`
}

/** Cookie Domain for shared auth across apex + `*.galleryHost` tenants. */
export function sessionCookieDomain(galleryHost: string): string | undefined {
  const base = galleryHost.trim().toLowerCase()
  if (!base) return undefined
  return `.${base}`
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
