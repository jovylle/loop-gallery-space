<template>
  <div>
    <div v-if="settingUp" class="text-center py-20 text-[var(--text-muted)]">
      Creating your gallery space…
    </div>
    <template v-else>
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-2xl font-semibold">Settings</h1>
        <NuxtLink
          v-if="profile?.username"
          v-bind="manageGalleryLink"
          class="btn-ghost"
        >
          ← Back
        </NuxtLink>
      </div>

      <div v-if="profile" class="space-y-8">
        <DashboardAvatarPicker :profile="profile" />

        <DashboardProfileEditor :profile="profile" @saved="onSaved" />
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { profile, refreshProfile, completeOnboarding } = useAuth()
const { navigateToManageProfile, manageProfileUrl, linkTo } = useProfileUrl()

const manageGalleryLink = computed(() =>
  profile.value?.username ? linkTo(manageProfileUrl(profile.value.username)) : {},
)
const settingUp = ref(false)

onMounted(async () => {
  if (!profile.value?.needsOnboarding) return
  settingUp.value = true
  try {
    await completeOnboarding()
    if (profile.value?.username) {
      await navigateToManageProfile(profile.value.username)
    }
  }
  finally {
    settingUp.value = false
  }
})

async function onSaved() {
  await refreshProfile()
  if (profile.value?.username) {
    await navigateToManageProfile(profile.value.username)
  }
}
</script>
