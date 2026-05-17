<template>
  <GalleryMasonryGrid
    v-if="viewMode === 'masonry'"
    :items="items"
    :density="density"
    @open="$emit('open', $event)"
  />

  <div
    v-else-if="viewMode === 'grid'"
    class="gallery-grid"
  >
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      class="gallery-grid__cell media-tile group"
      @click="$emit('open', index)"
    >
      <GalleryMediaThumb :item="item" fit="cover" />
      <div
        v-if="item.caption"
        class="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <p class="text-[10px] text-white/90 line-clamp-2 text-left">{{ item.caption }}</p>
      </div>
    </button>
  </div>

  <div
    v-else-if="viewMode === 'list'"
    class="gallery-list mx-auto w-full max-w-md"
  >
    <button
      v-for="(item, index) in items"
      :key="item.id"
      type="button"
      class="gallery-list__row"
      @click="$emit('open', index)"
    >
      <div class="gallery-list__thumb">
        <GalleryMediaThumb :item="item" fit="cover" />
      </div>
      <div class="min-w-0 flex-1 text-left">
        <p class="text-sm font-medium truncate leading-snug">
          {{ item.caption || 'Untitled' }}
        </p>
        <p class="text-[11px] text-[var(--text-muted)] mt-0.5 truncate">
          {{ formatMeta(item) }}
        </p>
      </div>
      <span class="text-[var(--text-muted)] text-sm shrink-0 opacity-60" aria-hidden="true">›</span>
    </button>
  </div>

  <div
    v-else-if="viewMode === 'feed'"
    class="max-w-2xl mx-auto space-y-10"
  >
    <article
      v-for="(item, index) in items"
      :key="item.id"
      class="media-tile group cursor-pointer"
      @click="$emit('open', index)"
    >
      <GalleryMediaThumb :item="item" fit="contain" image-class="w-full rounded-xl" />
      <div v-if="item.caption" class="mt-3 px-1">
        <p class="text-sm text-[var(--text-primary)]">{{ item.caption }}</p>
        <p class="text-xs text-[var(--text-muted)] mt-1">{{ formatMeta(item) }}</p>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import type { GalleryViewMode } from '~/shared/gallery-view'
import type { PublicGalleryItem, UserTheme } from '~/shared/types'

defineProps<{
  items: PublicGalleryItem[]
  viewMode: GalleryViewMode
  density?: UserTheme['density']
}>()

defineEmits<{ open: [index: number] }>()

function formatMeta(item: PublicGalleryItem) {
  const type = item.mediaType === 'video' ? 'Video' : 'Image'
  const date = item.createdAt
    ? new Date(item.createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : ''
  return date ? `${type} · ${date}` : type
}
</script>
