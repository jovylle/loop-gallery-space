import { isValidAvatarKey } from '~/server/utils/avatar'
import { RESERVED_USERNAMES, USERNAME_REGEX } from '~/shared/constants'
import type { UserLink, UserTheme } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{
    username?: string
    displayTitle?: string
    bio?: string
    links?: UserLink[]
    theme?: UserTheme
    isPublic?: boolean
    avatarKey?: string
  }>(event)

  const db = getDb(event)
  const updates: string[] = []
  const values: unknown[] = []

  if (body.username !== undefined) {
    const username = body.username.toLowerCase().trim()
    if (!USERNAME_REGEX.test(username)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid username' })
    }
    if (RESERVED_USERNAMES.has(username)) {
      throw createError({ statusCode: 400, statusMessage: 'Username reserved' })
    }
    const taken = await db
      .prepare('SELECT id FROM users WHERE username = ? AND id != ?')
      .bind(username, user.id)
      .first()
    if (taken) {
      throw createError({ statusCode: 409, statusMessage: 'Username taken' })
    }
    updates.push('username = ?')
    values.push(username)
  }

  if (body.displayTitle !== undefined) {
    updates.push('display_title = ?')
    values.push(body.displayTitle)
  }
  if (body.bio !== undefined) {
    updates.push('bio = ?')
    values.push(body.bio)
  }
  if (body.links !== undefined) {
    updates.push('links_json = ?')
    values.push(JSON.stringify(body.links))
  }
  if (body.theme !== undefined) {
    updates.push('theme_json = ?')
    values.push(JSON.stringify(body.theme))
  }
  if (body.isPublic !== undefined) {
    updates.push('is_public = ?')
    values.push(body.isPublic ? 1 : 0)
  }
  if (body.avatarKey !== undefined) {
    const avatarKey = body.avatarKey.trim()
    if (!isValidAvatarKey(avatarKey, user.id)) {
      throw createError({ statusCode: 400, statusMessage: 'Invalid avatar' })
    }
    updates.push('avatar_key = ?')
    values.push(avatarKey)
  }

  if (updates.length) {
    values.push(user.id)
    await db
      .prepare(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`)
      .bind(...values)
      .run()
  }

  return await db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first()
})
