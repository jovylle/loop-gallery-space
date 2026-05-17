import { useLocalStorage } from '@vueuse/core'
import {
  type GallerySortMode,
  type GalleryViewMode,
  sortGalleryItems,
} from '~/shared/gallery-view'
import type { PublicGalleryItem } from '~/shared/types'

const VALID_VIEW_MODES: GalleryViewMode[] = ['grid', 'list', 'feed']

export function useGalleryView() {
  const viewMode = useLocalStorage<GalleryViewMode>('loopgallery-view-mode', 'grid')
  const sortMode = useLocalStorage<GallerySortMode>('loopgallery-sort-mode', 'newest')

  if (import.meta.client) {
    watch(
      viewMode,
      (mode) => {
        if (!VALID_VIEW_MODES.includes(mode)) {
          viewMode.value = 'grid'
        }
      },
      { immediate: true },
    )
  }

  function sortedItems(items: PublicGalleryItem[]) {
    return sortGalleryItems(items, sortMode.value)
  }

  return {
    viewMode,
    sortMode,
    sortedItems,
  }
}
