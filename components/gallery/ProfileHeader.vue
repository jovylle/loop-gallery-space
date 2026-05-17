<template>
  <header :class="portfolio ? 'text-center mb-8 animate-fade-up' : 'text-center mb-10 animate-fade-up'">
    <div
      v-if="avatarUrl"
      :class="portfolio ? 'w-16 h-16 mx-auto rounded-full overflow-hidden ring-2 ring-accent/30 mb-3' : 'w-20 h-20 mx-auto rounded-full overflow-hidden ring-2 ring-accent/30 shadow-glow mb-4'"
    >
      <img :src="avatarUrl" :alt="displayTitle || username" class="w-full h-full object-cover">
    </div>
    <div
      v-else
      :class="portfolio ? 'w-16 h-16 mx-auto rounded-full bg-elevated flex items-center justify-center text-xl font-mono text-accent mb-3' : 'w-20 h-20 mx-auto rounded-full bg-elevated flex items-center justify-center text-2xl font-mono text-accent mb-4'"
    >
      {{ initial }}
    </div>
    <h1 v-if="!portfolio" class="text-3xl sm:text-4xl font-semibold tracking-tight mb-2">
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
        class="chip-link"
      >
        {{ link.label }}
      </a>
    </div>
    <p v-if="!portfolio" class="mt-3 font-mono text-sm text-[var(--text-muted)]">@{{ username }}</p>
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
  portfolio?: boolean
}>()

const initial = computed(() => (props.username?.[0] || '?').toUpperCase())
</script>
