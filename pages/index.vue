<template>
  <div>
    <section class="text-center py-12 sm:py-20 animate-fade-up">
      <p class="font-mono text-sm text-accent mb-4 tracking-wider uppercase">
        {{ tagline }}
      </p>
      <h1 class="text-4xl sm:text-6xl font-semibold tracking-tight mb-6 max-w-2xl mx-auto leading-tight">
        Your own corner of the internet
      </h1>
      <p class="text-[var(--text-muted)] text-lg max-w-xl mx-auto mb-8">
        Collect loops, memories, moods. Build a visual space that feels like you.
      </p>
      <NuxtLink to="/login" class="btn-primary text-base px-8 py-3">
        Make My Own
      </NuxtLink>
    </section>

    <section v-if="featured.length" class="mt-16">
      <h2 class="text-xl font-medium mb-6 text-[var(--text-muted)]">
        Explore galleries
      </h2>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <NuxtLink
          v-for="g in featured"
          :key="g.username"
          :to="`/${g.username}`"
          class="surface-card p-4 hover:border-accent/30 transition group"
        >
          <div
            v-if="g.avatarUrl"
            class="w-12 h-12 rounded-full overflow-hidden mb-3 ring-1 ring-white/10 group-hover:ring-accent/40"
          >
            <img :src="g.avatarUrl" alt="" class="w-full h-full object-cover">
          </div>
          <div
            v-else
            class="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center font-mono text-accent mb-3"
          >
            {{ g.username[0] }}
          </div>
          <p class="font-medium truncate">{{ g.displayTitle }}</p>
          <p class="text-xs font-mono text-[var(--text-muted)]">@{{ g.username }}</p>
          <p class="text-xs text-[var(--text-muted)] mt-1">{{ g.itemCount }} items</p>
        </NuxtLink>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const appConfig = useAppConfig()
const tagline = appConfig.site.taglines[0]

const { fetchFeatured } = useGallery()
const { data: featured } = await useAsyncData('featured', () => fetchFeatured().catch(() => []), {
  default: () => [],
})
</script>
