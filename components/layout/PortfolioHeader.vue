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
        <!--
          Manage is tucked in the menu (not shown as a header button) and only for the
          signed-in gallery owner — public visitors must not see an edit affordance here.
        -->
        <UiBurgerMenu
          v-if="ownerManageLink"
          label="Gallery menu"
        >
          <template #default="{ close }">
            <a
              role="menuitem"
              :href="ownerManageLink"
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
/**
 * Portfolio layout header (tenant subdomain, e.g. user.loopgallery.com).
 * Public visitors see theme toggle only. Signed-in owners get a menu "Manage" link
 * to the apex dashboard (`/{username}?manage=1`); everyone else gets nothing.
 */
const tenant = useTenantUsername()
const { manageProfileUrl } = useProfileUrl()
const { profile: authProfile, isAuthenticated } = useAuth()

const { data: profile } = useTenantProfile(tenant)

const siteTitle = computed(() => {
  if (profile.value?.displayTitle) return profile.value.displayTitle
  if (profile.value?.username) return profile.value.username
  if (tenant.value) return tenant.value
  return 'Gallery'
})

const ownerManageLink = computed(() => {
  if (!tenant.value || !isAuthenticated.value) return ''
  if (authProfile.value?.username?.toLowerCase() !== tenant.value.toLowerCase()) return ''
  return manageProfileUrl(tenant.value)
})
</script>
