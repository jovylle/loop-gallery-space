export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{ orderedIds: string[] }>(event)

  if (!Array.isArray(body.orderedIds)) {
    throw createError({ statusCode: 400, statusMessage: 'orderedIds required' })
  }

  const db = getDb(event)
  const statements = body.orderedIds.map((id, index) =>
    db.prepare('UPDATE gallery_items SET sort_order = ? WHERE id = ? AND user_id = ?').bind(
      index,
      id,
      user.id,
    ),
  )

  if (statements.length) {
    await db.batch(statements)
  }

  return { ok: true }
})
