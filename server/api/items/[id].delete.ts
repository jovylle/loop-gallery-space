import { deleteR2Object } from '~/server/utils/r2'
import type { GalleryItemRecord } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const db = getDb(event)

  const item = await db
    .prepare('SELECT * FROM gallery_items WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first<GalleryItemRecord>()

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  await deleteR2Object(event, item.r2_key)
  const thumbKey = item.r2_key.replace(/original\./, 'thumb.')
  if (thumbKey !== item.r2_key) {
    await deleteR2Object(event, thumbKey).catch(() => {})
  }

  const sizeBytes = item.size_bytes ?? 0
  await db.prepare('DELETE FROM gallery_items WHERE id = ?').bind(id).run()
  if (sizeBytes > 0) {
    await db
      .prepare('UPDATE users SET storage_bytes = MAX(0, storage_bytes - ?) WHERE id = ?')
      .bind(sizeBytes, user.id)
      .run()
  }

  return { ok: true }
})
