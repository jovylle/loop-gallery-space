<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <h1 class="text-2xl font-semibold">Settings</h1>
      <NuxtLink to="/dashboard" class="btn-ghost">← Back</NuxtLink>
    </div>

    <div v-if="profile" class="space-y-8">
      <section>
        <h2 class="text-sm font-medium text-[var(--text-muted)] mb-3 uppercase tracking-wide">
          Avatar
        </h2>
        <input ref="avatarInput" type="file" accept="image/*" class="hidden" @change="onAvatar">
        <button type="button" class="btn-ghost" :disabled="avatarUploading" @click="avatarInput?.click()">
          {{ avatarUploading ? 'Uploading…' : 'Change avatar' }}
        </button>
      </section>

      <DashboardProfileEditor :profile="profile" @saved="onSaved" />
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { profile, refreshProfile } = useAuth()
const { uploadFile } = useUpload()

const avatarInput = ref<HTMLInputElement>()
const avatarUploading = ref(false)

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
    await navigateTo('/dashboard')
  }
}
</script>
