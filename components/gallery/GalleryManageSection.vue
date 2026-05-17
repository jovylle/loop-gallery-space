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

    <DashboardUploadDropzone class="mb-6" @uploaded="onUploaded" />

    <DashboardQuotaNotes :usage="quotaUsage" class="mb-10" />

    <section v-if="items?.length" class="mb-8">
      <h2 class="text-lg font-medium mb-1">Organize</h2>
      <p class="text-sm text-[var(--text-muted)] mb-4">
        Edit captions · delete items
      </p>
      <DashboardSortableGrid
        :items="items"
        :sortable="false"
        @reorder="onReorder"
        @delete="onDelete"
        @caption-updated="refreshItems"
      />
    </section>

  </div>
</template>

<script setup lang="ts">
import type { PublicGalleryItem } from '~/shared/types'
const props = defineProps<{
  username: string
}>()

const emit = defineEmits<{ refreshed: [] }>()

const { apiFetch } = useAuth()
const { usage: quotaUsage, refreshQuota } = useQuota()

onMounted(() => {
  refreshQuota().catch(() => {})
})

const { data: items, refresh: refreshItems } = await useAsyncData(
  'my-items',
  () => apiFetch<PublicGalleryItem[]>('/api/items'),
  { server: false },
)

async function onUploaded() {
  await Promise.all([
    refreshItems(),
    refreshQuota().catch(() => {}),
    refreshNuxtData(`profile-${props.username.toLowerCase()}`),
  ])
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
  await Promise.all([
    refreshItems(),
    refreshQuota().catch(() => {}),
    refreshNuxtData(`profile-${props.username.toLowerCase()}`),
  ])
  emit('refreshed')
}

</script>
