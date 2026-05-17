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

    <GalleryManageSection
      v-if="showManageTools"
      :username="username"
      @refreshed="onManageRefreshed"
    />

    <GalleryProfileHeader
      :username="profile.username"
      :display-title="profile.displayTitle"
      :bio="profile.bio"
      :avatar-url="profile.avatarUrl"
      :links="profile.links"
      :portfolio="isPortfolio"
    />
    <template v-if="displayItems.length">
      <GalleryViewToolbar
        v-model:view-mode="viewMode"
        v-model:sort-mode="sortMode"
        :item-count="displayItems.length"
      />
      <GalleryItemsView
        :items="displayItems"
        :view-mode="viewMode"
        @open="openLightbox"
      />
    </template>
    <p v-else-if="!showManageTools" class="text-center text-[var(--text-muted)] py-16">
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
const { appUrl, profileUrl, navigateToHref } = useProfileUrl()
const { profile: authProfile, loading: authLoading, isAuthenticated } = useAuth()

const isManageMode = computed(() => route.query.manage === '1')
const isOwner = computed(
  () =>
    isAuthenticated.value
    && authProfile.value?.username?.toLowerCase() === username.value,
)
/** Tenant subdomains are public portfolios — no manage/share chrome there (see PortfolioHeader). */
const showManageBanner = computed(
  () => !isPortfolio.value && isManageMode.value && isOwner.value,
)
/** Upload/organize UI only for the signed-in owner on apex `?manage=1`. */
const showManageTools = computed(() => isManageMode.value && isOwner.value)
const publicShareUrl = computed(() => profileUrl(username.value))
const homeUrl = computed(() => (isPortfolio.value ? '/' : appUrl('/')))

const username = computed(() => props.username.toLowerCase())
const { viewMode, sortMode, sortedItems } = useGalleryView()

const { data: profile, pending, error, refresh: refreshProfile } = useTenantProfile(username)

const displayItems = computed(() =>
  profile.value ? sortedItems(profile.value.items) : [],
)

// `?manage=1` is owner-only: guests sign in; other signed-in users go home (not a public view).
watch(
  [isManageMode, authLoading, isAuthenticated, isOwner],
  () => {
    if (!import.meta.client || !isManageMode.value || authLoading.value) return
    if (!isAuthenticated.value) {
      navigateTo(`/login?next=${encodeURIComponent(route.fullPath)}`)
      return
    }
    if (!isOwner.value) {
      navigateToHref(homeUrl.value)
    }
  },
  { immediate: true },
)

async function onManageRefreshed() {
  await refreshProfile()
}

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
