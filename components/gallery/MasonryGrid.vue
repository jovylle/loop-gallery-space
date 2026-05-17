<template>
  <div :class="['masonry-grid', densityClass]">
    <GalleryMediaCard
      v-for="(item, index) in items"
      :key="item.id"
      :item="item"
      class="animate-fade-up"
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

const densityClass = computed(() => {
  const d = props.density || 'normal'
  return `masonry-grid--${d}`
})
</script>
