import type { MaybeRef } from 'vue'
import { toValue } from 'vue'
import type { PublicProfile } from '~/shared/types'

/** Shared profile fetch for tenant pages (header + gallery). Uses request-scoped fetch on SSR. */
export function useTenantProfile(username: MaybeRef<string | null | undefined>) {
  const api = useRequestFetch()

  const resolved = computed(() => {
    const u = toValue(username)
    return u ? u.toLowerCase() : null
  })

  return useAsyncData(
    () => (resolved.value ? `profile-${resolved.value}` : 'profile-skip'),
    () => {
      if (!resolved.value) return Promise.resolve(null)
      return api<PublicProfile>(`/api/profiles/${encodeURIComponent(resolved.value)}`)
    },
    { watch: [resolved] },
  )
}
