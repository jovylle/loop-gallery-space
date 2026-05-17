import { RESERVED_USERNAMES, USERNAME_REGEX } from '~/shared/constants'

export default defineEventHandler(async (event) => {
  await verifyFirebaseToken(event)
  const body = await readBody<{ username?: string }>(event)
  const username = body.username?.toLowerCase().trim()

  if (!username) {
    return { available: false, reason: 'Username is required' }
  }

  if (!USERNAME_REGEX.test(username)) {
    return {
      available: false,
      reason: 'Use 3–24 lowercase letters, numbers, or underscores',
    }
  }

  if (RESERVED_USERNAMES.has(username)) {
    return { available: false, reason: 'Username is reserved' }
  }

  const db = getDb(event)
  const existing = await db
    .prepare('SELECT id FROM users WHERE username = ?')
    .bind(username)
    .first()

  return { available: !existing }
})
