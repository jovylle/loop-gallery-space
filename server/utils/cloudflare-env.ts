import type { D1Database, R2Bucket } from '@cloudflare/workers-types'
import { CF_BINDINGS } from '~/shared/constants'

export type LoopGalleryBindings = {
  [CF_BINDINGS.d1]: D1Database
  [CF_BINDINGS.r2]: R2Bucket
}

export function getCloudflareEnv(event: H3Event): LoopGalleryBindings | undefined {
  return (event.context as { cloudflare?: { env?: LoopGalleryBindings } }).cloudflare?.env
}
