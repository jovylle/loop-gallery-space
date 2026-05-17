import {
  galleryAppUrl,
  isAbsoluteUrl,
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
    return isAbsoluteUrl(url) ? navigateTo(url, { external: true }) : navigateTo(url)
  }

  function navigateToProfile(username: string, path = '/') {
    return navigateToHref(profileUrl(username, path))
  }

  function navigateToManageProfile(username: string) {
    return navigateToHref(manageProfileUrl(username))
  }

  /** Props for NuxtLink when `to` may be a full https URL. */
  function linkTo(url: string) {
    return isAbsoluteUrl(url) ? { to: url, external: true as const } : { to: url }
  }

  function profileLink(username: string, path = '/') {
    return linkTo(profileUrl(username, path))
  }

  /** External portfolio URL — opens in a new tab (e.g. Explore galleries). */
  function profileLinkNewTab(username: string, path = '/') {
    const url = profileUrl(username, path)
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
    return isAbsoluteUrl(profileUrl(username, path))
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
