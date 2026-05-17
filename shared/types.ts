export interface UserLink {
  label: string
  url: string
}

export interface UserTheme {
  accent?: string
  background?: string
  density?: 'compact' | 'normal' | 'spacious'
}

export interface UserRecord {
  id: string
  firebase_uid: string
  username: string
  display_title: string | null
  bio: string | null
  avatar_key: string | null
  links_json: string | null
  theme_json: string | null
  is_public: number
  storage_bytes: number
  created_at: string
}

export interface GalleryItemRecord {
  id: string
  user_id: string
  r2_key: string
  media_type: string
  mime: string | null
  width: number | null
  height: number | null
  caption: string | null
  tags_json: string | null
  sort_order: number
  blurhash: string | null
  size_bytes?: number
  created_at: string
}

export interface PublicProfile {
  username: string
  displayTitle: string | null
  bio: string | null
  avatarUrl: string | null
  links: UserLink[]
  theme: UserTheme
  items: PublicGalleryItem[]
}

export interface PublicGalleryItem {
  id: string
  mediaUrl: string
  mediaType: string
  mime: string | null
  width: number | null
  height: number | null
  caption: string | null
  tags: string[]
  sortOrder: number
  createdAt: string
}

export interface QuotaUsage {
  storageBytes: number
  storageMax: number
  itemCount: number
  itemMax: number
  uploadsToday: number
  uploadsPerDayMax: number
  maxUploadBytes: number
}

export interface AuthUser {
  id: string
  firebaseUid: string
  username: string | null
  displayTitle: string | null
  bio: string | null
  avatarUrl: string | null
  avatarKey: string | null
  isPublic: boolean
  storageBytes: number
  needsOnboarding: boolean
}
