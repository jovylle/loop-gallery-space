<template>
  <VueDraggable
    v-model="localItems"
    class="grid grid-cols-2 sm:grid-cols-3 gap-3"
    :animation="200"
    @end="onReorder"
  >
    <div
      v-for="element in localItems"
      :key="element.id"
      class="surface-card p-2 cursor-grab active:cursor-grabbing"
    >
      <img
        v-if="element.mediaType !== 'video'"
        :src="element.mediaUrl"
        class="w-full aspect-square object-cover rounded-lg"
      >
      <video
        v-else
        :src="element.mediaUrl"
        class="w-full aspect-square object-cover rounded-lg"
        muted
        loop
        autoplay
        playsinline
      />
      <input
        v-model="captions[element.id]"
        type="text"
        placeholder="Caption"
        class="input-field mt-2 text-xs"
        @change="saveCaption(element.id)"
      >
      <button
        type="button"
        class="mt-2 w-full text-xs text-red-400 hover:text-red-300"
        @click="$emit('delete', element.id)"
      >
        Delete
      </button>
    </div>
  </VueDraggable>
</template>

<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import type { PublicGalleryItem } from '~/shared/types'

const props = defineProps<{ items: PublicGalleryItem[] }>()
const emit = defineEmits<{ reorder: [ids: string[]]; delete: [id: string]; 'caption-updated': [] }>()

const { apiFetch } = useAuth()
const localItems = ref([...props.items])
const captions = ref<Record<string, string>>({})

watch(
  () => props.items,
  (v) => {
    localItems.value = [...v]
    for (const item of v) {
      captions.value[item.id] = item.caption || ''
    }
  },
  { immediate: true },
)

function onReorder() {
  emit(
    'reorder',
    localItems.value.map(i => i.id),
  )
}

async function saveCaption(id: string) {
  await apiFetch(`/api/items/${id}`, {
    method: 'PATCH',
    body: { caption: captions.value[id] },
  })
  emit('caption-updated')
}
</script>
