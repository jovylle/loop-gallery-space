<template>
  <section class="rounded-2xl border border-accent/25 bg-accent/10 p-4 sm:p-5">
    <p class="text-[10px] font-mono uppercase tracking-wider text-accent mb-1.5">
      Share with friends
    </p>
    <p class="text-sm font-mono break-all text-[var(--text-primary)] leading-relaxed">
      {{ url }}
    </p>
    <div class="mt-4 flex flex-wrap gap-2">
      <button type="button" class="btn-primary text-sm" @click="copy">
        {{ copied ? 'Copied!' : 'Copy public link' }}
      </button>
      <NuxtLink
        v-if="viewLink"
        v-bind="viewLink"
        class="btn-ghost text-sm inline-flex items-center gap-1.5"
      >
        View live portfolio
        <UiExternalIcon v-if="portfolioLinkIsExternal" />
      </NuxtLink>
    </div>
  </section>
</template>

<script setup lang="ts">
const props = defineProps<{
  url: string
  username?: string
}>()

const { profileLink } = useProfileUrl()
const copied = ref(false)

const viewLink = computed(() =>
  props.username ? profileLink(props.username) : null,
)

const portfolioLinkIsExternal = computed(
  () => props.url.startsWith('http://') || props.url.startsWith('https://'),
)

async function copy() {
  if (!props.url) return
  try {
    await navigator.clipboard.writeText(props.url)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    // ignore
  }
}
</script>
