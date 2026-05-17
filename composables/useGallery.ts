import type { PublicProfile } from '~/shared/types'

export function useGallery() {
  const api = useRequestFetch()

  async function fetchProfile(username: string) {
    return api<PublicProfile>(`/api/profiles/${encodeURIComponent(username)}`)
  }

  async function fetchFeatured() {
    return api<Array<{
      username: string
      displayTitle: string
      bio: string | null
      avatarUrl: string | null
      itemCount: number
    }>>('/api/galleries/featured')
  }

  return { fetchProfile, fetchFeatured }
}
