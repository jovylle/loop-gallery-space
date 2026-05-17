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
    <div
      v-if="showManageBanner"
      class="surface-card p-4 mb-6 flex flex-col sm:flex-row sm:items-center gap-3 border-accent/20"
    >
      <div class="min-w-0 flex-1">
        <p class="text-xs font-mono uppercase tracking-wider text-accent mb-1">Public portfolio link</p>
        <p class="text-sm font-mono break-all text-[var(--text-muted)]">{{ publicShareUrl }}</p>
      </div>
      <button type="button" class="btn-primary shrink-0 text-sm" @click="copyShareUrl">
        {{ shareCopied ? 'Copied' : 'Copy link' }}
      </button>
    </div>
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
const shareCopied = ref(false)
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

async function copyShareUrl() {
  if (!publicShareUrl.value) return
  try {
    await navigator.clipboard.writeText(publicShareUrl.value)
    shareCopied.value = true
    setTimeout(() => { shareCopied.value = false }, 2000)
  }
  catch {
    // ignore
  }
}

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
