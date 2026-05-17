import { dicebearThumbsUrl, generateUniqueUsername } from '~/server/utils/username'
import { toAuthUser } from '~/server/utils/user-response'
import type { UserRecord } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ displayName?: string }>(event).catch(() => ({}))

  if (user.username) {
    return toAuthUser(user)
  }

  const db = getDb(event)
  const username = await generateUniqueUsername(db)
  const avatarKey = dicebearThumbsUrl(user.id)
  const displayTitle =
    body.displayName?.trim() || user.display_title || username

  await db
    .prepare(
      `UPDATE users SET username = ?, avatar_key = ?, display_title = ?, is_public = 1 WHERE id = ?`,
    )
    .bind(username, avatarKey, displayTitle, user.id)
    .run()

  const updated = await db
    .prepare('SELECT * FROM users WHERE id = ?')
    .bind(user.id)
    .first<UserRecord>()

  return toAuthUser(updated!)
})
