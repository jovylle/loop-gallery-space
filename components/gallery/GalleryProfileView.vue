<template>
  <div v-if="pending" class="text-center py-20 text-[var(--text-muted)]">
    Loading gallery…
  </div>
  <div v-else-if="error" class="text-center py-20">
    <p class="text-2xl font-medium mb-2">Gallery not found</p>
    <p class="text-[var(--text-muted)] mb-6">This space doesn't exist or is private.</p>
    <NuxtLink :to="homeUrl" class="btn-primary">Back home</NuxtLink>
  </div>
  <div v-else-if="profile">
    <GalleryShareCard
      v-if="showManageBanner"
      :url="publicShareUrl"
      :username="username"
      class="mb-6"
    />
    <GalleryProfileHeader
      :username="profile.username"
      :display-title="profile.displayTitle"
      :bio="profile.bio"
      :avatar-url="profile.avatarUrl"
      :links="profile.links"
      :portfolio="isPortfolio"
    />
    <template v-if="profile.items.length">
      <GalleryViewToolbar
        v-model:view-mode="viewMode"
        v-model:sort-mode="sortMode"
        :item-count="displayItems.length"
      />
      <GalleryItemsView
        :items="displayItems"
        :view-mode="viewMode"
        :density="profile.theme.density"
        @open="openLightbox"
      />
    </template>
    <p v-else class="text-center text-[var(--text-muted)] py-16">
      No items yet.
    </p>
    <GalleryLightboxModal
      :open="lightboxOpen"
      :items="displayItems"
      :index="lightboxIndex"
      @close="lightboxOpen = false"
      @prev="prevItem"
      @next="nextItem"
    />
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  username: string
}>()

const route = useRoute()
const isPortfolio = useIsTenantGalleryHost()
const { appUrl, profileUrl } = useProfileUrl()
const showManageBanner = computed(() => !isPortfolio.value && route.query.manage === '1')
const publicShareUrl = computed(() => profileUrl(username.value))
const homeUrl = computed(() => (isPortfolio.value ? '/' : appUrl('/')))

const username = computed(() => props.username.toLowerCase())
const { fetchProfile } = useGallery()
const { viewMode, sortMode, sortedItems } = useGalleryView()

const { data: profile, pending, error } = await useAsyncData(
  () => `profile-${username.value}`,
  () => fetchProfile(username.value),
)

const displayItems = computed(() =>
  profile.value ? sortedItems(profile.value.items) : [],
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
  if (!displayItems.value.length) return
  lightboxIndex.value =
    (lightboxIndex.value - 1 + displayItems.value.length) % displayItems.value.length
}

function nextItem() {
  if (!displayItems.value.length) return
  lightboxIndex.value = (lightboxIndex.value + 1) % displayItems.value.length
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
