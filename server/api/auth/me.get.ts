import type { AuthUser } from '~/shared/types'
import { mediaUrl } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  const user = await requireAuthOrCreate(event)

  const authUser: AuthUser = {
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

  return authUser
})
