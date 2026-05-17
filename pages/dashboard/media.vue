<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-2xl font-semibold">Media</h1>
        <p class="text-[var(--text-muted)] text-sm">Drag to reorder · click caption to edit</p>
      </div>
      <NuxtLink to="/dashboard" class="btn-ghost">← Back</NuxtLink>
    </div>

    <DashboardUploadDropzone class="mb-8" @uploaded="refresh" />

    <div v-if="pending" class="text-[var(--text-muted)]">Loading…</div>
    <DashboardSortableGrid
      v-else-if="items?.length"
      :items="items"
      @reorder="onReorder"
      @delete="onDelete"
      @caption-updated="refresh"
    />
    <p v-else class="text-center text-[var(--text-muted)] py-12">
      No media yet. Upload something above.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { PublicGalleryItem } from '~/shared/types'

definePageMeta({ middleware: 'auth' })

const { apiFetch } = useAuth()

const { data: items, pending, refresh } = await useAsyncData('my-items', () =>
  apiFetch<PublicGalleryItem[]>('/api/items'),
)

async function onReorder(orderedIds: string[]) {
  await apiFetch('/api/items/reorder', {
    method: 'POST',
    body: { orderedIds },
  })
  await refresh()
}

async function onDelete(id: string) {
  if (!confirm('Delete this item?')) return
  await apiFetch(`/api/items/${id}`, { method: 'DELETE' })
  await refresh()
}
</script>
