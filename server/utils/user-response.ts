import type { AuthUser } from '~/shared/types'
import type { UserRecord } from '~/shared/types'
import { mediaUrl } from './r2'

export function toAuthUser(user: UserRecord): AuthUser {
  return {
    id: user.id,
    firebaseUid: user.firebase_uid,
    username: user.username,
    displayTitle: user.display_title,
    bio: user.bio,
    avatarUrl: mediaUrl(user.avatar_key),
    isPublic: user.is_public === 1,
    storageBytes: user.storage_bytes,
    needsOnboarding: !user.username,
  }
}
