<template>
  <header class="sticky top-0 z-50 border-b border-white/5 bg-base/90 backdrop-blur-lg">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
      <NuxtLink to="/" class="min-w-0 group">
        <span class="text-lg font-semibold tracking-tight truncate block group-hover:text-accent transition-colors">
          {{ siteTitle }}
        </span>
      </NuxtLink>

      <div ref="menuRoot" class="relative shrink-0">
        <button
          type="button"
          class="inline-flex items-center justify-center w-10 h-10 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5 transition-colors"
          :aria-expanded="menuOpen"
          aria-haspopup="true"
          aria-label="Menu"
          @click="menuOpen = !menuOpen"
        >
          <span class="sr-only">Menu</span>
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
          </svg>
        </button>

        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95 -translate-y-1"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="menuOpen"
            class="absolute right-0 mt-2 w-[min(100vw-2rem,20rem)] rounded-2xl border border-white/10 bg-[var(--bg-elevated)] shadow-soft p-2"
            role="menu"
          >
            <div class="rounded-xl bg-accent/10 border border-accent/25 p-3 mb-2">
              <p class="text-[10px] font-mono uppercase tracking-wider text-accent mb-1.5">
                Share with friends
              </p>
              <p class="text-xs text-[var(--text-primary)] break-all leading-relaxed font-mono">
                {{ publicLink }}
              </p>
              <button
                type="button"
                class="mt-2.5 w-full btn-primary text-xs py-2"
                @click="copyPublicLink"
              >
                {{ copied ? 'Copied!' : 'Copy public link' }}
              </button>
            </div>

            <a
              :href="manageLink"
              class="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-[var(--text-primary)] hover:bg-white/5 transition-colors"
              role="menuitem"
              @click="menuOpen = false"
            >
              <span>Manage</span>
              <span class="text-[var(--text-muted)]" aria-hidden="true">→</span>
            </a>
            <p class="px-3 pb-1 text-[10px] text-[var(--text-muted)] font-mono truncate">
              {{ manageLinkDisplay }}
            </p>
          </div>
        </Transition>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'

const tenant = useTenantUsername()
const { profileUrl, manageProfileUrl, appUrl } = useProfileUrl()
const { fetchProfile } = useGallery()

const menuRoot = ref<HTMLElement | null>(null)
const menuOpen = ref(false)
const copied = ref(false)

const { data: profile } = await useAsyncData(
  () => (tenant.value ? `profile-${tenant.value}` : 'profile-none'),
  () => (tenant.value ? fetchProfile(tenant.value) : null),
)

const siteTitle = computed(() => {
  if (profile.value?.displayTitle) return profile.value.displayTitle
  if (profile.value?.username) return profile.value.username
  if (tenant.value) return tenant.value
  return 'Gallery'
})

const publicLink = computed(() => {
  if (!tenant.value) return ''
  return profileUrl(tenant.value)
})

const manageLink = computed(() => {
  if (!tenant.value) return appUrl('/dashboard')
  return manageProfileUrl(tenant.value)
})

const manageLinkDisplay = computed(() => {
  if (!tenant.value) return ''
  try {
    const url = new URL(manageLink.value)
    return `${url.host}/${tenant.value}`
  }
  catch {
    return manageLink.value
  }
})

onClickOutside(menuRoot, () => {
  menuOpen.value = false
})

async function copyPublicLink() {
  if (!publicLink.value) return
  try {
    await navigator.clipboard.writeText(publicLink.value)
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
