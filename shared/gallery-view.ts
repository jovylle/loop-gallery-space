import type { PublicGalleryItem } from './types'

export type GalleryViewMode = 'masonry' | 'grid' | 'list' | 'feed'

export type GallerySortMode =
  | 'order'
  | 'newest'
  | 'oldest'
  | 'caption-asc'
  | 'caption-desc'

export const GALLERY_VIEW_MODES: { id: GalleryViewMode; label: string }[] = [
  { id: 'masonry', label: 'Masonry' },
  { id: 'grid', label: 'Grid' },
  { id: 'list', label: 'List' },
  { id: 'feed', label: 'Feed' },
]

export const GALLERY_SORT_OPTIONS: { id: GallerySortMode; label: string }[] = [
  { id: 'order', label: 'Custom order' },
  { id: 'newest', label: 'Newest first' },
  { id: 'oldest', label: 'Oldest first' },
  { id: 'caption-asc', label: 'Caption A–Z' },
  { id: 'caption-desc', label: 'Caption Z–A' },
]

export function sortGalleryItems(
  items: PublicGalleryItem[],
  mode: GallerySortMode,
): PublicGalleryItem[] {
  const list = [...items]

  switch (mode) {
    case 'newest':
      return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    case 'oldest':
      return list.sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    case 'caption-asc':
      return list.sort((a, b) =>
        (a.caption || '\uffff').localeCompare(b.caption || '\uffff', undefined, {
          sensitivity: 'base',
        }),
      )
    case 'caption-desc':
      return list.sort((a, b) =>
        (b.caption || '').localeCompare(a.caption || '', undefined, {
          sensitivity: 'base',
        }),
      )
    case 'order':
    default:
      return list.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
        return a.createdAt.localeCompare(b.createdAt)
      })
  }
}
