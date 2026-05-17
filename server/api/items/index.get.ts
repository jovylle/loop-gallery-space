import { mapItem } from '~/server/utils/profile'
import type { GalleryItemRecord } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDb(event)
  const { results } = await db
    .prepare(
      'SELECT * FROM gallery_items WHERE user_id = ? ORDER BY sort_order ASC, created_at ASC',
    )
    .bind(user.id)
    .all<GalleryItemRecord>()

  return (results || []).map(mapItem)
})
