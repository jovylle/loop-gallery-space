<template>
  <div class="mb-10">
    <div class="flex flex-wrap items-end justify-between gap-4 mb-4">
      <div>
        <h2 class="text-lg font-medium">Upload media</h2>
        <p class="text-sm text-[var(--text-muted)]">
          Add images or short loops to your gallery
        </p>
      </div>
      <NuxtLink to="/dashboard/settings" class="btn-ghost text-sm shrink-0">
        Settings
      </NuxtLink>
    </div>

    <DashboardUploadDropzone class="mb-10" @uploaded="onUploaded" />

    <section v-if="items?.length" class="mb-8">
      <h2 class="text-lg font-medium mb-1">Organize</h2>
      <p class="text-sm text-[var(--text-muted)] mb-4">
        Drag to reorder · edit captions · delete items
      </p>
      <DashboardSortableGrid
        :items="items"
        @reorder="onReorder"
        @delete="onDelete"
        @caption-updated="refreshItems"
      />
    </section>

    <div v-if="storageBytes != null" class="surface-card p-4 text-sm text-[var(--text-muted)]">
      Storage: {{ formatBytes(storageBytes) }} / {{ formatBytes(quotaMax) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicGalleryItem } from '~/shared/types'
import { QUOTAS } from '~/shared/constants'

const props = defineProps<{
  username: string
  storageBytes?: number
}>()

const emit = defineEmits<{ refreshed: [] }>()

const { apiFetch } = useAuth()
const quotaMax = QUOTAS.maxStorageBytes

const { data: items, refresh: refreshItems } = await useAsyncData(
  'my-items',
  () => apiFetch<PublicGalleryItem[]>('/api/items'),
  { server: false },
)

async function onUploaded() {
  await refreshItems()
  await refreshNuxtData(`profile-${props.username.toLowerCase()}`)
  emit('refreshed')
}

async function onReorder(orderedIds: string[]) {
  await apiFetch('/api/items/reorder', {
    method: 'POST',
    body: { orderedIds },
  })
  await refreshItems()
  await refreshNuxtData(`profile-${props.username.toLowerCase()}`)
  emit('refreshed')
}

async function onDelete(id: string) {
  if (!confirm('Delete this item?')) return
  await apiFetch(`/api/items/${id}`, { method: 'DELETE' })
  await refreshItems()
  await refreshNuxtData(`profile-${props.username.toLowerCase()}`)
  emit('refreshed')
}

function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}

</script>
