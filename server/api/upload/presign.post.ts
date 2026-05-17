import { QUOTAS } from '~/shared/constants'
import { assertDailyUploadQuota, assertItemCountQuota, assertStorageQuota } from '~/server/utils/quota'
import { createPresignedPutUrl } from '~/server/utils/r2'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const body = await readBody<{
    filename?: string
    mime?: string
    sizeBytes?: number
    kind?: 'item' | 'avatar'
  }>(event)

  const sizeBytes = body.sizeBytes ?? 0
  if (sizeBytes > QUOTAS.maxUploadBytes) {
    throw createError({ statusCode: 413, statusMessage: 'File exceeds 8 MB limit' })
  }

  if (body.kind !== 'avatar') {
    await assertItemCountQuota(event, user.id)
    await assertDailyUploadQuota(event, user.id)
  }
  assertStorageQuota(user, sizeBytes)

  const itemId = crypto.randomUUID()
  const ext = guessExtension(body.mime || '', body.filename || '')
  const kind = body.kind === 'avatar' ? 'avatar' : 'items'

  let key: string
  if (kind === 'avatar') {
    key = `u/${user.id}/avatar.${ext}`
  }
  else {
    key = `u/${user.id}/items/${itemId}/original.${ext}`
  }

  const uploadUrl = await createPresignedPutUrl(event, key, body.mime || 'application/octet-stream')

  return {
    uploadUrl,
    r2Key: key,
    itemId: kind === 'items' ? itemId : undefined,
    method: uploadUrl.startsWith('http') ? 'PUT' : 'POST',
  }
})

function guessExtension(mime: string, filename: string): string {
  if (mime.includes('webp')) return 'webp'
  if (mime.includes('png')) return 'png'
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg'
  if (mime.includes('gif')) return 'gif'
  if (mime.includes('mp4') || mime.includes('video')) return 'mp4'
  const fromName = filename.split('.').pop()?.toLowerCase()
  if (fromName && fromName.length <= 4) return fromName
  return 'webp'
}
