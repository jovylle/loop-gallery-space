import { QUOTAS } from '~/shared/constants'

type FetchLikeError = {
  statusCode?: number
  statusMessage?: string
  message?: string
  data?: { statusMessage?: string; message?: string }
}

export function formatUploadError(error: unknown): string {
  if (!(error instanceof Error)) return 'Upload failed'

  const err = error as FetchLikeError
  const serverMsg =
    err.data?.statusMessage || err.statusMessage || err.data?.message || err.message

  if (err.statusCode === 429 || serverMsg?.includes('Daily upload limit')) {
    return `You've hit today's upload limit (${QUOTAS.maxUploadsPerDay} per day). Try again tomorrow.`
  }
  if (serverMsg?.includes('Gallery item limit')) {
    return `Your gallery is full (${QUOTAS.maxItemsPerGallery} items max). Delete something to upload more.`
  }
  if (serverMsg?.includes('Storage limit')) {
    return `Not enough storage left (${QUOTAS.maxStorageBytes / 1024 / 1024} MB account max). Delete items to free space.`
  }
  if (
    err.statusCode === 413
    || serverMsg?.includes('File too large')
    || serverMsg?.includes('exceeds 8 MB')
  ) {
    return `File is too large (max ${QUOTAS.maxUploadBytes / 1024 / 1024} MB per file).`
  }

  return serverMsg || 'Upload failed'
}
