import type { GalleryItemRecord, PublicGalleryItem, PublicProfile, UserLink, UserRecord, UserTheme } from '~/shared/types'
import { mediaUrl } from './r2'

export function parseJson<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  }
  catch {
    return fallback
  }
}

export function mapItem(row: GalleryItemRecord): PublicGalleryItem {
  return {
    id: row.id,
    mediaUrl: mediaUrl(row.r2_key) || '',
    mediaType: row.media_type,
    mime: row.mime,
    width: row.width,
    height: row.height,
    caption: row.caption,
    tags: parseJson<string[]>(row.tags_json, []),
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export function mapProfile(user: UserRecord, items: GalleryItemRecord[]): PublicProfile {
  return {
    username: user.username || '',
    displayTitle: user.display_title,
    bio: user.bio,
    avatarUrl: mediaUrl(user.avatar_key),
    links: parseJson<UserLink[]>(user.links_json, []),
    theme: parseJson<UserTheme>(user.theme_json, { density: 'normal' }),
    items: items.map(mapItem),
  }
}
