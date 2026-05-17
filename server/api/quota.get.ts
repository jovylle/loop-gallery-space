import { QUOTAS } from '~/shared/constants'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb(event)

  const [uploadsRow, itemsRow] = await Promise.all([
    db
      .prepare(
        `SELECT COUNT(*) as count FROM upload_log
         WHERE user_id = ? AND created_at >= datetime('now', '-1 day')`,
      )
      .bind(user.id)
      .first<{ count: number }>(),
    db
      .prepare('SELECT COUNT(*) as count FROM gallery_items WHERE user_id = ?')
      .bind(user.id)
      .first<{ count: number }>(),
  ])

  return {
    storageBytes: user.storage_bytes,
    storageMax: QUOTAS.maxStorageBytes,
    itemCount: itemsRow?.count ?? 0,
    itemMax: QUOTAS.maxItemsPerGallery,
    uploadsToday: uploadsRow?.count ?? 0,
    uploadsPerDayMax: QUOTAS.maxUploadsPerDay,
    maxUploadBytes: QUOTAS.maxUploadBytes,
  }
})
