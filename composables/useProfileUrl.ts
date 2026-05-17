import {
  galleryAppUrl,
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
