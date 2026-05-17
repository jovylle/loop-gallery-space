<template>
  <header class="sticky top-0 z-50 border-b border-[var(--border)] bg-base/80 backdrop-blur-lg">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <span class="text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
          LoopGallery
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-2 sm:gap-4">
        <UiThemeToggle />
        <NuxtLink
          v-if="profile?.username"
          v-bind="myGalleryLink"
          class="btn-ghost hidden sm:inline-flex items-center gap-1.5"
          :aria-label="myGalleryIsExternal ? 'My gallery (opens your public portfolio)' : 'My gallery'"
        >
          My gallery
          <UiExternalIcon v-if="myGalleryIsExternal" />
        </NuxtLink>
        <NuxtLink v-if="isAuthenticated" to="/dashboard" class="btn-ghost hidden sm:inline-flex">
          Dashboard
        </NuxtLink>
        <template v-if="isAuthenticated">
          <button type="button" class="btn-ghost" @click="logout">
            Sign out
          </button>
        </template>
        <template v-else>
          <NuxtLink to="/login" class="btn-ghost hidden sm:inline-flex">
            Sign in
          </NuxtLink>
          <NuxtLink to="/login" class="btn-primary">
            Make My Own
          </NuxtLink>
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const { profile, logout, isAuthenticated } = useAuth()
const { profileLink, profileUrl } = useProfileUrl()

const myGalleryLink = computed(() =>
  profile.value?.username ? profileLink(profile.value.username) : {},
)

const myGalleryIsExternal = computed(() => {
  if (!profile.value?.username) return false
  const url = profileUrl(profile.value.username)
  return url.startsWith('http://') || url.startsWith('https://')
})
</script>
