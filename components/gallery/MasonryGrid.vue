<template>
  <div :class="gridClass">
    <GalleryMediaCard
      v-for="(item, index) in items"
      :key="item.id"
      :item="item"
      class="w-full animate-fade-up"
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

const gridClass = computed(() => {
  const base = 'grid gap-3 sm:gap-4 w-full'
  switch (props.density) {
    case 'compact':
      return `${base} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`
    case 'spacious':
      return `${base} grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto`
    default:
      return `${base} grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`
  }
})
</script>
