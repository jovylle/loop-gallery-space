<template>
  <article class="media-tile group w-full" @click="$emit('open')">
    <video
      v-if="item.mediaType === 'video' || item.mime?.includes('video')"
      :src="item.mediaUrl"
      class="w-full h-auto block"
      autoplay
      loop
      muted
      playsinline
      loading="lazy"
    />
    <img
      v-else
      :src="item.mediaUrl"
      :alt="item.caption || 'Gallery item'"
      class="w-full h-auto block"
      loading="lazy"
      decoding="async"
    >
    <div
      v-if="item.caption"
      class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <p class="text-xs text-white/90 line-clamp-2">{{ item.caption }}</p>
    </div>
  </article>
</template>

<script setup lang="ts">
import type { PublicGalleryItem } from '~/shared/types'

defineProps<{ item: PublicGalleryItem }>()
defineEmits<{ open: [] }>()
</script>
