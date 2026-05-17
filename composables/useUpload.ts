import { QUOTAS } from '~/shared/constants'

export function useUpload() {
  const { apiFetch } = useAuth()

  async function compressImage(file: File, maxWidth = 1600, quality = 0.85): Promise<Blob> {
    if (!file.type.startsWith('image/') || file.type === 'image/gif') {
      return file
    }

    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, maxWidth / bitmap.width)
    const w = Math.round(bitmap.width * scale)
    const h = Math.round(bitmap.height * scale)

    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')!
    ctx.drawImage(bitmap, 0, 0, w, h)
    bitmap.close()

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Compression failed'))),
        'image/webp',
        quality,
      )
    })
    return blob
  }

  async function uploadFile(
    file: File,
    options: { kind?: 'item' | 'avatar'; caption?: string } = {},
  ) {
    let blob: Blob = file
    let mime = file.type

    if (file.type.startsWith('image/') && file.type !== 'image/gif') {
      blob = await compressImage(file)
      mime = 'image/webp'
    }

    if (blob.size > QUOTAS.maxUploadBytes) {
      throw new Error(`File too large (max ${QUOTAS.maxUploadBytes / 1024 / 1024} MB)`)
    }

    const presign = await apiFetch<{
      uploadUrl: string
      r2Key: string
      itemId?: string
      method: string
    }>('/api/upload/presign', {
      method: 'POST',
      body: {
        filename: file.name,
        mime,
        sizeBytes: blob.size,
        kind: options.kind || 'item',
      },
    })

    const headers: Record<string, string> = { 'Content-Type': mime }

    if (presign.method === 'PUT' && presign.uploadUrl.startsWith('http')) {
      await fetch(presign.uploadUrl, { method: 'PUT', body: blob, headers })
    }
    else {
      const { getIdToken } = useAuth()
      const token = await getIdToken()
      await fetch(presign.uploadUrl, {
        method: 'POST',
        body: blob,
        headers: {
          ...headers,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
    }

    if (options.kind === 'avatar') {
      await apiFetch('/api/profile', {
        method: 'PATCH',
        body: { avatarKey: presign.r2Key },
      })
      return { r2Key: presign.r2Key }
    }

    const mediaType = mime.startsWith('video/') ? 'video' : mime === 'image/gif' ? 'gif' : 'image'

    const item = await apiFetch('/api/items', {
      method: 'POST',
      body: {
        r2Key: presign.r2Key,
        mediaType,
        mime,
        sizeBytes: blob.size,
        caption: options.caption,
      },
    })

    return item
  }

  type UploadManyOptions = {
    kind?: 'item' | 'avatar'
    concurrency?: number
    onFileStart?: (file: File) => void
    onFileComplete?: (file: File, error?: Error) => void
  }

  type UploadManyResult = {
    succeeded: number
    failed: number
    errors: { file: File; message: string }[]
  }

  async function uploadMany(
    files: File[],
    options: UploadManyOptions = {},
  ): Promise<UploadManyResult> {
    const concurrency = Math.max(1, options.concurrency ?? 3)
    const queue = [...files]
    let succeeded = 0
    let failed = 0
    const errors: { file: File; message: string }[] = []

    async function worker() {
      while (queue.length > 0) {
        const file = queue.shift()!
        options.onFileStart?.(file)
        try {
          await uploadFile(file, { kind: options.kind })
          succeeded++
          options.onFileComplete?.(file)
        }
        catch (e) {
          const message = e instanceof Error ? e.message : 'Upload failed'
          failed++
          errors.push({ file, message })
          options.onFileComplete?.(file, e instanceof Error ? e : new Error(message))
        }
      }
    }

    const workers = Array.from(
      { length: Math.min(concurrency, files.length) },
      () => worker(),
    )
    await Promise.all(workers)

    return { succeeded, failed, errors }
  }

  return { uploadFile, uploadMany, compressImage }
}
