<template>
  <header class="text-center mb-10 animate-fade-up">
    <div
      v-if="avatarUrl"
      class="w-20 h-20 mx-auto rounded-full overflow-hidden ring-2 ring-accent/30 shadow-glow mb-4"
    >
      <img :src="avatarUrl" :alt="displayTitle" class="w-full h-full object-cover">
    </div>
    <div
      v-else
      class="w-20 h-20 mx-auto rounded-full bg-elevated flex items-center justify-center text-2xl font-mono text-accent mb-4"
    >
      {{ initial }}
    </div>
    <h1 class="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
      {{ displayTitle || username }}
    </h1>
    <p v-if="bio" class="text-[var(--text-muted)] max-w-md mx-auto mb-4">
      {{ bio }}
    </p>
    <div v-if="links?.length" class="flex flex-wrap justify-center gap-2">
      <a
        v-for="link in links"
        :key="link.url"
        :href="link.url"
        target="_blank"
        rel="noopener noreferrer"
        class="px-3 py-1 rounded-full text-xs font-mono bg-white/5 hover:bg-white/10 border border-white/10 transition"
      >
        {{ link.label }}
      </a>
    </div>
    <p class="mt-3 font-mono text-sm text-[var(--text-muted)]">@{{ username }}</p>
  </header>
</template>

<script setup lang="ts">
import type { UserLink } from '~/shared/types'

const props = defineProps<{
  username: string
  displayTitle?: string | null
  bio?: string | null
  avatarUrl?: string | null
  links?: UserLink[]
}>()

const initial = computed(() => (props.username?.[0] || '?').toUpperCase())
</script>
