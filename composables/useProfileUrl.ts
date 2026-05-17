import {
  galleryAppUrl,
  profilePublicUrl,
  tenantUsernameFromHost,
} from '~/shared/host'

export function useProfileUrl() {
  const config = useRuntimeConfig()

  const galleryHost = computed(() => String(config.public.galleryHost || ''))
  const siteUrl = computed(() => String(config.public.siteUrl || ''))

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
    const host =
      hostname
      ?? (import.meta.server
        ? useRequestHeaders(['host']).host
        : import.meta.client
          ? window.location.hostname
          : undefined)
    if (!host || !galleryHost.value) return null
    return tenantUsernameFromHost(host.split(':')[0]!, galleryHost.value)
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
