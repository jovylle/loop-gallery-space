import {
  galleryAppUrl,
  isAbsoluteUrl,
  isSameGalleryAppUrl,
  parseTenantGalleryHost,
  profilePublicUrl,
  tenantUsernameFromHost,
} from '~/shared/host'

function requestHostname(): string | undefined {
  if (import.meta.server) {
    return useRequestHeaders(['host']).host?.split(':')[0]
  }
  if (import.meta.client) {
    return window.location.hostname
  }
  return undefined
}

export function useProfileUrl() {
  const config = useRuntimeConfig()

  const inferred = computed(() => {
    const host = requestHostname()
    return host ? parseTenantGalleryHost(host) : null
  })

  const galleryHost = computed(
    () => String(config.public.galleryHost || '') || inferred.value?.galleryHost || '',
  )

  const siteUrl = computed(() => {
    const configured = String(config.public.siteUrl || '')
    if (configured && configured !== 'http://localhost:3000') return configured
    if (galleryHost.value) return `https://${galleryHost.value}`
    return configured || 'http://localhost:3000'
  })

  function staysInGalleryApp(url: string): boolean {
    return isSameGalleryAppUrl(url, galleryHost.value)
  }

  function profileUrl(username: string, path = '/'): string {
    return profilePublicUrl(username, galleryHost.value, siteUrl.value, path)
  }

  function appUrl(path = '/'): string {
    if (!galleryHost.value) return path
    return galleryAppUrl(galleryHost.value, siteUrl.value, path)
  }

  /** Apex profile path with app chrome (skips subdomain redirect). */
  function manageProfileUrl(username: string): string {
    const u = username.toLowerCase()
    return appUrl(`/${u}?manage=1`)
  }

  function navigateToHref(url: string) {
    if (staysInGalleryApp(url)) {
      if (import.meta.client && isAbsoluteUrl(url)) {
        window.location.assign(url)
        return Promise.resolve()
      }
      return navigateTo(url)
    }
    return isAbsoluteUrl(url) ? navigateTo(url, { external: true }) : navigateTo(url)
  }

  function navigateToProfile(username: string, path = '/') {
    return navigateToHref(profileUrl(username, path))
  }

  function navigateToManageProfile(username: string) {
    return navigateToHref(manageProfileUrl(username))
  }

  /** Post-login destination: own dashboard unless `next` is a safe same-origin path. */
  function resolvePostLoginPath(next: string | undefined, ownUsername: string): string {
    const own = ownUsername.toLowerCase()
    const fallback = manageProfileUrl(own)

    if (!next?.length) return fallback
    if (/^https?:\/\//i.test(next)) return fallback

    const path = next.startsWith('/') ? next : `/${next}`

    if (path.includes('manage=1')) {
      const match = path.match(/^\/([a-z0-9_]{3,24})(?:\/|\?|$)/i)
      if (match && match[1]!.toLowerCase() !== own) return fallback
    }

    return path
  }

  /** Props for NuxtLink when `to` may be a full https URL. */
  function linkTo(url: string) {
    if (staysInGalleryApp(url)) {
      return { to: url }
    }
    return isAbsoluteUrl(url) ? { to: url, external: true as const } : { to: url }
  }

  function profileLink(username: string, path = '/') {
    return linkTo(profileUrl(username, path))
  }

  /** Opens portfolio in a new tab on web; same WebView on Capacitor. */
  function profileLinkNewTab(username: string, path = '/') {
    const url = profileUrl(username, path)
    if (staysInGalleryApp(url)) {
      return { to: url }
    }
    if (isAbsoluteUrl(url)) {
      return {
        to: url,
        external: true as const,
        target: '_blank',
        rel: 'noopener noreferrer',
      }
    }
    return { to: url }
  }

  function isExternalProfileUrl(username: string, path = '/') {
    return !staysInGalleryApp(profileUrl(username, path))
  }

  function tenantUsername(hostname?: string): string | null {
    const host = (hostname ?? requestHostname())?.split(':')[0]
    if (!host) return null

    if (galleryHost.value) {
      return tenantUsernameFromHost(host, galleryHost.value)
    }

    return parseTenantGalleryHost(host)?.tenant ?? null
  }

  return {
    galleryHost,
    profileUrl,
    appUrl,
    manageProfileUrl,
    navigateToHref,
    navigateToProfile,
    navigateToManageProfile,
    resolvePostLoginPath,
    linkTo,
    profileLink,
    profileLinkNewTab,
    isExternalProfileUrl,
    tenantUsername,
  }
}

export function useTenantUsername() {
  const { tenantUsername } = useProfileUrl()
  return computed(() => tenantUsername())
}

/** True on `user.loopgallery.example.com` — public gallery, not the signed-in app. */
export function useIsTenantGalleryHost() {
  return computed(() => !!useTenantUsername().value)
}
