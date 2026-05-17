<template>
  <div :class="masonryClass">
    <GalleryMediaCard
      v-for="(item, index) in items"
      :key="item.id"
      :item="item"
      class="gallery-masonry__item w-full animate-fade-up"
      :style="{ animationDelay: `${Math.min(index * 40, 400)}ms` }"
      @open="$emit('open', index)"
    />
  </div>
</template>

<script setup lang="ts">
import type { PublicGalleryItem, UserTheme } from '~/shared/types'

const props = defineProps<{
  items: PublicGalleryItem[]
  density?: UserTheme['density']
}>()

defineEmits<{ open: [index: number] }>()

const masonryClass = computed(() => {
  const density = props.density ?? 'default'
  return `gallery-masonry gallery-masonry--${density}`
})
</script>
