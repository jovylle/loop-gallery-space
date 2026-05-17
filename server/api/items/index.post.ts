import { QUOTAS } from '~/shared/constants'
import {
  assertDailyUploadQuota,
  assertItemCountQuota,
  assertStorageQuota,
  logUpload,
} from '~/server/utils/quota'
import type { GalleryItemRecord } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{
    r2Key: string
    mediaType: string
    mime?: string
    width?: number
    height?: number
    caption?: string
    tags?: string[]
    sizeBytes?: number
  }>(event)

  if (!body.r2Key?.startsWith(`u/${user.id}/`)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid storage key' })
  }

  const sizeBytes = body.sizeBytes ?? 0
  if (sizeBytes > QUOTAS.maxUploadBytes) {
    throw createError({ statusCode: 413, statusMessage: 'File too large' })
  }

  await assertItemCountQuota(event, user.id)
  await assertDailyUploadQuota(event, user.id)
  assertStorageQuota(user, sizeBytes)

  const db = getDb(event)
  const maxOrder = await db
    .prepare('SELECT COALESCE(MAX(sort_order), -1) as m FROM gallery_items WHERE user_id = ?')
    .bind(user.id)
    .first<{ m: number }>()

  const id = crypto.randomUUID()
  const sortOrder = (maxOrder?.m ?? -1) + 1

  await db
    .prepare(
      `INSERT INTO gallery_items
       (id, user_id, r2_key, media_type, mime, width, height, caption, tags_json, sort_order, size_bytes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      user.id,
      body.r2Key,
      body.mediaType,
      body.mime ?? null,
      body.width ?? null,
      body.height ?? null,
      body.caption ?? null,
      body.tags ? JSON.stringify(body.tags) : null,
      sortOrder,
      sizeBytes,
    )
    .run()

  await db
    .prepare('UPDATE users SET storage_bytes = storage_bytes + ? WHERE id = ?')
    .bind(sizeBytes, user.id)
    .run()

  await logUpload(event, user.id)

  const item = await db
    .prepare('SELECT * FROM gallery_items WHERE id = ?')
    .bind(id)
    .first<GalleryItemRecord>()

  return mapItem(item!)
})
