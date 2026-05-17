<template>
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4"
      @click.self="$emit('close')"
    >
      <button
        type="button"
        class="absolute top-4 right-4 btn-ghost text-white z-10"
        aria-label="Close"
        @click="$emit('close')"
      >
        ✕
      </button>
      <button
        v-if="items.length > 1"
        type="button"
        class="absolute left-4 top-1/2 -translate-y-1/2 btn-ghost text-white"
        aria-label="Previous"
        @click="$emit('prev')"
      >
        ‹
      </button>
      <button
        v-if="items.length > 1"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2 btn-ghost text-white"
        aria-label="Next"
        @click="$emit('next')"
      >
        ›
      </button>

      <div v-if="current" class="max-w-5xl max-h-[90vh] w-full flex flex-col items-center">
        <video
          v-if="current.mediaType === 'video' || current.mime?.includes('video')"
          :src="current.mediaUrl"
          class="max-h-[80vh] max-w-full rounded-lg"
          controls
          autoplay
          loop
        />
        <img
          v-else
          :src="current.mediaUrl"
          :alt="current.caption || ''"
          class="max-h-[80vh] max-w-full object-contain rounded-lg"
        >
        <p v-if="current.caption" class="mt-4 text-center text-[var(--text-muted)] text-sm max-w-lg">
          {{ current.caption }}
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import type { PublicGalleryItem } from '~/shared/types'

const props = defineProps<{
  open: boolean
  items: PublicGalleryItem[]
  index: number
}>()

defineEmits<{ close: []; prev: []; next: [] }>()

const current = computed(() => props.items[props.index])
</script>
