import type { R2Bucket } from '@cloudflare/workers-types'
import { AwsClient } from 'aws4fetch'
import { CF_BINDINGS } from '~/shared/constants'
import { getCloudflareEnv } from './cloudflare-env'

export function getMediaBucket(event: H3Event): R2Bucket {
  const bucket = getCloudflareEnv(event)?.[CF_BINDINGS.r2]
  if (!bucket) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Media storage unavailable.',
    })
  }
  return bucket
}

export function mediaUrl(key: string | null | undefined): string | null {
  if (!key) return null
  const config = useRuntimeConfig()
  const base = config.public.mediaBaseUrl?.replace(/\/$/, '')
  if (base) return `${base}/${key}`
  return `/api/media/${encodeURIComponent(key)}`
}

export async function createPresignedPutUrl(
  event: H3Event,
  key: string,
  contentType: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const config = useRuntimeConfig(event)
  const accountId = config.r2AccountId
  const accessKeyId = config.r2AccessKeyId
  const secretAccessKey = config.r2SecretAccessKey

  if (accountId && accessKeyId && secretAccessKey) {
    const bucket = CF_BINDINGS.r2
    const url = new URL(
      `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`,
    )
    url.searchParams.set('X-Amz-Expires', String(expiresInSeconds))

    const client = new AwsClient({
      accessKeyId,
      secretAccessKey,
      service: 's3',
      region: 'auto',
    })

    const signed = await client.sign(
      new Request(url.toString(), {
        method: 'PUT',
        headers: { 'Content-Type': contentType },
      }),
      { aws: { signQuery: true } },
    )
    return signed.url
  }

  return `/api/upload/direct?key=${encodeURIComponent(key)}`
}

export async function deleteR2Object(event: H3Event, key: string) {
  const bucket = getMediaBucket(event)
  await bucket.delete(key)
}
