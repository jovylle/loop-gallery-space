<template>
  <header class="sticky top-0 z-50 border-b border-white/5 bg-base/80 backdrop-blur-lg">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
      <NuxtLink to="/" class="flex items-center gap-2 group">
        <span class="text-lg font-semibold tracking-tight group-hover:text-accent transition-colors">
          LoopGallery
        </span>
      </NuxtLink>

      <nav class="flex items-center gap-2 sm:gap-4">
        <template v-if="isVisitorGallery">
          <a :href="appUrl('/login')" class="btn-ghost hidden sm:inline-flex">
            Sign in
          </a>
          <a :href="appUrl('/login')" class="btn-primary">
            Make My Own
          </a>
        </template>
        <template v-else>
          <NuxtLink v-if="profile?.username" :to="profileUrl(profile.username)" class="btn-ghost hidden sm:inline-flex">
            My gallery
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
        </template>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
const isVisitorGallery = useIsTenantGalleryHost()
const { profile, logout, isAuthenticated } = useAuth()
const { profileUrl, appUrl } = useProfileUrl()
</script>
