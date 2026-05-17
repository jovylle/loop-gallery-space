import type { PublicProfile } from '~/shared/types'

export function useGallery() {
  async function fetchProfile(username: string) {
    return $fetch<PublicProfile>(`/api/profiles/${encodeURIComponent(username)}`)
  }

  async function fetchFeatured() {
    return $fetch<Array<{
      username: string
      displayTitle: string
      bio: string | null
      avatarUrl: string | null
      itemCount: number
    }>>('/api/galleries/featured')
  }

  return { fetchProfile, fetchFeatured }
}
