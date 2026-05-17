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
        <section class="flex items-center gap-4">
          <img
            v-if="profile.avatarUrl"
            :src="profile.avatarUrl"
            alt=""
            class="w-16 h-16 rounded-full ring-2 ring-accent/30 object-cover bg-elevated"
          >
          <div>
            <h2 class="text-sm font-medium text-[var(--text-muted)] mb-2 uppercase tracking-wide">
              Avatar
            </h2>
            <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatar">
            <button type="button" class="btn-ghost" :disabled="avatarUploading" @click="avatarInput?.click()">
              {{ avatarUploading ? 'Uploading…' : 'Change avatar' }}
            </button>
          </div>
        </section>

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
const { uploadFile } = useUpload()

const avatarInput = ref<HTMLInputElement>()
const avatarUploading = ref(false)
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

async function onAvatar(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  avatarUploading.value = true
  try {
    await uploadFile(file, { kind: 'avatar' })
    await refreshProfile()
  }
  finally {
    avatarUploading.value = false
  }
}

async function onSaved() {
  await refreshProfile()
  if (profile.value?.username) {
    await navigateToManageProfile(profile.value.username)
  }
}
</script>
