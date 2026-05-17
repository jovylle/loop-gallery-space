import type { LoopGalleryBindings } from '~/server/utils/cloudflare-env'

declare module 'h3' {
  interface H3EventContext {
    cloudflare?: {
      env?: LoopGalleryBindings
    }
  }
}
