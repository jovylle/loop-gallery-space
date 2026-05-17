import { RESERVED_USERNAMES } from '~/shared/constants'
import { mapProfile } from '~/server/utils/profile'
import type { GalleryItemRecord, UserRecord } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const username = getRouterParam(event, 'username')?.toLowerCase()
  if (!username || RESERVED_USERNAMES.has(username)) {
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
  }

  const db = getDb(event)
  const user = await db
    .prepare('SELECT * FROM users WHERE username = ? AND is_public = 1')
    .bind(username)
    .first<UserRecord>()

  if (!user) {
    throw createError({ statusCode: 404, statusMessage: 'Profile not found' })
  }

  const { results } = await db
    .prepare(
      'SELECT * FROM gallery_items WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    )
    .bind(user.id)
    .all<GalleryItemRecord>()

  return mapProfile(user, results || [])
})
