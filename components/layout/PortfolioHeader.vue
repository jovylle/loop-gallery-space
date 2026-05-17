<template>
  <header class="sticky top-0 z-50 border-b border-[var(--border)] bg-base/90 backdrop-blur-lg">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between gap-4">
      <NuxtLink to="/" class="min-w-0 group">
        <span class="text-lg font-semibold tracking-tight truncate block group-hover:text-accent transition-colors">
          {{ siteTitle }}
        </span>
      </NuxtLink>

      <div class="flex items-center gap-2 shrink-0">
        <UiThemeToggle />
        <UiBurgerMenu
          v-if="manageLink"
          label="Gallery menu"
        >
          <template #default="{ close }">
            <a
              role="menuitem"
              :href="manageLink"
              @click="close"
            >
              Manage
            </a>
          </template>
        </UiBurgerMenu>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
const tenant = useTenantUsername()
const { manageProfileUrl } = useProfileUrl()

const { data: profile } = useTenantProfile(tenant)

const siteTitle = computed(() => {
  if (profile.value?.displayTitle) return profile.value.displayTitle
  if (profile.value?.username) return profile.value.username
  if (tenant.value) return tenant.value
  return 'Gallery'
})

const manageLink = computed(() => {
  if (!tenant.value) return ''
  return manageProfileUrl(tenant.value)
})
</script>
