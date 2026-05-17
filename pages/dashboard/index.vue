<template>
  <div>
    <div class="flex flex-wrap items-start justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl font-semibold mb-1">Dashboard</h1>
        <p class="text-[var(--text-muted)] text-sm">
          Upload, preview, and organize your gallery
        </p>
      </div>
      <NuxtLink to="/dashboard/settings" class="btn-ghost shrink-0">
        Settings
      </NuxtLink>
    </div>

    <div v-if="profile?.needsOnboarding" class="surface-card p-6 mb-8 border-accent/30 text-[var(--text-muted)]">
      Setting up your gallery…
    </div>

    <GalleryShareCard
      v-if="profile?.username"
      :url="profileUrl(profile.username)"
      :username="profile.username"
      class="mb-8"
    />

    <DashboardUploadDropzone class="mb-10" @uploaded="onUploaded" />

    <section class="mb-10">
      <div class="flex flex-wrap items-end justify-between gap-4 mb-4">
        <h2 class="text-lg font-medium">Your gallery</h2>
        <NuxtLink
          v-if="profile?.username"
          v-bind="profileLinkNewTab(profile.username)"
          class="btn-ghost text-sm inline-flex items-center gap-1.5"
        >
          Open public page
          <UiExternalIcon v-if="isExternalProfileUrl(profile.username)" />
        </NuxtLink>
      </div>
      <p class="text-sm text-[var(--text-muted)] mb-4">
        This is how visitors see your space.
      </p>

      <div v-if="itemsPending" class="text-[var(--text-muted)] py-12 text-center">
        Loading gallery…
      </div>
      <template v-else-if="items?.length">
        <GalleryViewToolbar
          v-model:view-mode="viewMode"
          v-model:sort-mode="sortMode"
          :item-count="displayItems.length"
          class="mb-4"
        />
        <GalleryItemsView
          :items="displayItems"
          :view-mode="viewMode"
          :density="galleryDensity"
          @open="openLightbox"
        />
        <GalleryLightboxModal
          :open="lightboxOpen"
          :items="displayItems"
          :index="lightboxIndex"
          @close="lightboxOpen = false"
          @prev="prevLightbox"
          @next="nextLightbox"
        />
      </template>
      <p v-else class="text-center text-[var(--text-muted)] py-12 surface-card">
        No media yet. Upload something above to build your gallery.
      </p>
    </section>

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

    <div v-if="profile" class="surface-card p-4 text-sm text-[var(--text-muted)]">
      Storage: {{ formatBytes(profile.storageBytes) }} / {{ formatBytes(quotaMax) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PublicGalleryItem } from '~/shared/types'
import { QUOTAS } from '~/shared/constants'

definePageMeta({ middleware: 'auth' })

const { profile } = useAuth()
const { profileUrl, profileLinkNewTab, isExternalProfileUrl } = useProfileUrl()
const { apiFetch } = useAuth()
const { viewMode, sortMode, sortedItems } = useGalleryView()

const quotaMax = QUOTAS.maxStorageBytes
const username = computed(() => profile.value?.username ?? '')
const { data: publicProfile } = useTenantProfile(username)
const galleryDensity = computed(
  () => publicProfile.value?.theme.density ?? 'normal',
)

const { data: items, pending: itemsPending, refresh: refreshItems } = await useAsyncData(
  'my-items',
  () => apiFetch<PublicGalleryItem[]>('/api/items'),
)

const displayItems = computed(() =>
  items.value ? sortedItems(items.value) : [],
)

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

async function onUploaded() {
  await refreshItems()
  if (profile.value?.username) {
    await refreshNuxtData(`profile-${profile.value.username}`)
  }
}

async function onReorder(orderedIds: string[]) {
  await apiFetch('/api/items/reorder', {
    method: 'POST',
    body: { orderedIds },
  })
  await refreshItems()
}

async function onDelete(id: string) {
  if (!confirm('Delete this item?')) return
  await apiFetch(`/api/items/${id}`, { method: 'DELETE' })
  await refreshItems()
}

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function prevLightbox() {
  if (!displayItems.value.length) return
  lightboxIndex.value =
    (lightboxIndex.value - 1 + displayItems.value.length) % displayItems.value.length
}

function nextLightbox() {
  if (!displayItems.value.length) return
  lightboxIndex.value = (lightboxIndex.value + 1) % displayItems.value.length
}

function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
</script>
