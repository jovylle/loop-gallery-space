import { mediaUrl } from '~/server/utils/r2'
import type { UserRecord } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const db = getDb(event)
  const { results } = await db
    .prepare(
      `SELECT u.id, u.username, u.display_title, u.bio, u.avatar_key, u.theme_json,
        (SELECT COUNT(*) FROM gallery_items gi WHERE gi.user_id = u.id) as item_count
       FROM users u
       WHERE u.is_public = 1 AND u.username IS NOT NULL
       AND (SELECT COUNT(*) FROM gallery_items gi WHERE gi.user_id = u.id) >= 1
       ORDER BY RANDOM()
       LIMIT 12`,
    )
    .all<UserRecord & { item_count: number }>()

  return (results || []).map((u) => ({
    username: u.username,
    displayTitle: u.display_title || u.username,
    bio: u.bio,
    avatarUrl: mediaUrl(u.avatar_key),
    itemCount: u.item_count,
  }))
})
