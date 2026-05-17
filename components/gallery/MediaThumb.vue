<template>
  <video
    v-if="isVideo"
    :src="item.mediaUrl"
    :class="[fit === 'cover' ? 'w-full h-full object-cover' : 'w-full h-auto block', imageClass]"
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
    :class="[fit === 'cover' ? 'w-full h-full object-cover' : 'w-full h-auto block', imageClass]"
    loading="lazy"
    decoding="async"
  >
</template>

<script setup lang="ts">
import type { PublicGalleryItem } from '~/shared/types'

const props = withDefaults(
  defineProps<{
    item: PublicGalleryItem
    fit?: 'cover' | 'contain'
    imageClass?: string
  }>(),
  { fit: 'cover', imageClass: '' },
)

const isVideo = computed(
  () => props.item.mediaType === 'video' || !!props.item.mime?.includes('video'),
)
</script>
