<template>
  <div>
    <h1 class="text-2xl font-semibold mb-2">Dashboard</h1>
    <p class="text-[var(--text-muted)] mb-8">
      Manage your visual space
    </p>

    <div v-if="profile?.needsOnboarding" class="surface-card p-6 mb-8 border-accent/30 text-[var(--text-muted)]">
      Setting up your gallery…
    </div>

    <div class="grid sm:grid-cols-2 gap-4">
      <NuxtLink to="/dashboard/media" class="surface-card p-6 hover:border-accent/30 transition block">
        <h2 class="font-medium mb-1">Media</h2>
        <p class="text-sm text-[var(--text-muted)]">Upload and arrange your collection</p>
      </NuxtLink>
      <NuxtLink to="/dashboard/settings" class="surface-card p-6 hover:border-accent/30 transition block">
        <h2 class="font-medium mb-1">Settings</h2>
        <p class="text-sm text-[var(--text-muted)]">Profile, theme, visibility</p>
      </NuxtLink>
      <NuxtLink
        v-if="profile?.username"
        :to="`/${profile.username}`"
        class="surface-card p-6 hover:border-accent/30 transition block sm:col-span-2"
      >
        <h2 class="font-medium mb-1">View public gallery</h2>
        <p class="text-sm font-mono text-accent">/{{ profile.username }}</p>
      </NuxtLink>
    </div>

    <div v-if="profile" class="mt-8 surface-card p-4 text-sm text-[var(--text-muted)]">
      Storage: {{ formatBytes(profile.storageBytes) }} / {{ formatBytes(quotaMax) }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { QUOTAS } from '~/shared/constants'

definePageMeta({ middleware: 'auth' })

const { profile } = useAuth()
const quotaMax = QUOTAS.maxStorageBytes

function formatBytes(n: number) {
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / 1024 / 1024).toFixed(1)} MB`
}
</script>
