import { useLocalStorage } from '@vueuse/core'
import {
  type GallerySortMode,
  type GalleryViewMode,
  sortGalleryItems,
} from '~/shared/gallery-view'
import type { PublicGalleryItem } from '~/shared/types'

export function useGalleryView() {
  const viewMode = useLocalStorage<GalleryViewMode>('loopgallery-view-mode', 'masonry')
  const sortMode = useLocalStorage<GallerySortMode>('loopgallery-sort-mode', 'newest')

  function sortedItems(items: PublicGalleryItem[]) {
    return sortGalleryItems(items, sortMode.value)
  }

  return {
    viewMode,
    sortMode,
    sortedItems,
  }
}
