<template>
  <div v-if="pending" class="text-center py-20 text-[var(--text-muted)]">
    Loading gallery…
  </div>
  <div v-else-if="error" class="text-center py-20">
    <p class="text-2xl font-medium mb-2">Gallery not found</p>
    <p class="text-[var(--text-muted)] mb-6">This space doesn't exist or is private.</p>
    <NuxtLink to="/" class="btn-primary">Back home</NuxtLink>
  </div>
  <div v-else-if="profile">
    <GalleryProfileHeader
      :username="profile.username"
      :display-title="profile.displayTitle"
      :bio="profile.bio"
      :avatar-url="profile.avatarUrl"
      :links="profile.links"
    />
    <GalleryMasonryGrid
      v-if="profile.items.length"
      :items="profile.items"
      :density="profile.theme.density"
      @open="openLightbox"
    />
    <p v-else class="text-center text-[var(--text-muted)] py-16">
      No items yet.
    </p>
    <GalleryLightboxModal
      :open="lightboxOpen"
      :items="profile.items"
      :index="lightboxIndex"
      @close="lightboxOpen = false"
      @prev="prevItem"
      @next="nextItem"
    />
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const username = computed(() => String(route.params.username).toLowerCase())

const { fetchProfile } = useGallery()
const { data: profile, pending, error } = await useAsyncData(
  `profile-${username.value}`,
  () => fetchProfile(username.value),
)

useSeoMeta({
  title: () => profile.value?.displayTitle || profile.value?.username || 'Gallery',
  description: () => profile.value?.bio || 'A visual gallery on LoopGallery',
})

const lightboxOpen = ref(false)
const lightboxIndex = ref(0)

function openLightbox(index: number) {
  lightboxIndex.value = index
  lightboxOpen.value = true
}

function prevItem() {
  if (!profile.value) return
  lightboxIndex.value =
    (lightboxIndex.value - 1 + profile.value.items.length) % profile.value.items.length
}

function nextItem() {
  if (!profile.value) return
  lightboxIndex.value = (lightboxIndex.value + 1) % profile.value.items.length
}

function onKey(e: KeyboardEvent) {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') lightboxOpen.value = false
  if (e.key === 'ArrowLeft') prevItem()
  if (e.key === 'ArrowRight') nextItem()
}

onMounted(() => window.addEventListener('keydown', onKey))
onUnmounted(() => window.removeEventListener('keydown', onKey))
</script>
