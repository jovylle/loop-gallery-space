import { QUOTAS } from '~/shared/constants'
import type { UserRecord } from '~/shared/types'

export function assertStorageQuota(user: UserRecord, additionalBytes: number) {
  if (user.storage_bytes + additionalBytes > QUOTAS.maxStorageBytes) {
    throw createError({
      statusCode: 413,
      statusMessage: `Storage limit reached (${QUOTAS.maxStorageBytes / 1024 / 1024} MB max)`,
    })
  }
}

export async function assertDailyUploadQuota(event: H3Event, userId: string) {
  const db = getDb(event)
  const row = await db
    .prepare(
      `SELECT COUNT(*) as count FROM upload_log
       WHERE user_id = ? AND created_at >= datetime('now', '-1 day')`,
    )
    .bind(userId)
    .first<{ count: number }>()

  if ((row?.count ?? 0) >= QUOTAS.maxUploadsPerDay) {
    throw createError({
      statusCode: 429,
      statusMessage: `Daily upload limit reached (${QUOTAS.maxUploadsPerDay}/day)`,
    })
  }
}

export async function logUpload(event: H3Event, userId: string) {
  const db = getDb(event)
  await db.prepare('INSERT INTO upload_log (user_id) VALUES (?)').bind(userId).run()
}

export async function assertItemCountQuota(event: H3Event, userId: string) {
  const db = getDb(event)
  const row = await db
    .prepare('SELECT COUNT(*) as count FROM gallery_items WHERE user_id = ?')
    .bind(userId)
    .first<{ count: number }>()

  if ((row?.count ?? 0) >= QUOTAS.maxItemsPerGallery) {
    throw createError({
      statusCode: 413,
      statusMessage: `Gallery item limit reached (${QUOTAS.maxItemsPerGallery} max)`,
    })
  }
}
