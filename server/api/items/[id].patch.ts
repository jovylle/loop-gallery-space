import type { GalleryItemRecord } from '~/shared/types'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const id = getRouterParam(event, 'id')
  const body = await readBody<{ caption?: string; tags?: string[] }>(event)

  const db = getDb(event)
  const item = await db
    .prepare('SELECT * FROM gallery_items WHERE id = ? AND user_id = ?')
    .bind(id, user.id)
    .first<GalleryItemRecord>()

  if (!item) {
    throw createError({ statusCode: 404, statusMessage: 'Item not found' })
  }

  await db
    .prepare('UPDATE gallery_items SET caption = ?, tags_json = ? WHERE id = ?')
    .bind(
      body.caption ?? item.caption,
      body.tags ? JSON.stringify(body.tags) : item.tags_json,
      id,
    )
    .run()

  return await db.prepare('SELECT * FROM gallery_items WHERE id = ?').bind(id).first()
})
