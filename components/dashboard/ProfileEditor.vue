<template>
  <form class="surface-card p-6 space-y-5" @submit.prevent="save">
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-1">Username</label>
      <div class="flex gap-2">
        <input v-model="form.username" type="text" class="input-field font-mono" pattern="[a-z0-9_]+">
        <span v-if="usernameStatus === 'ok'" class="text-green-400 text-sm self-center">✓</span>
        <span v-if="usernameStatus === 'taken'" class="text-red-400 text-sm self-center">taken</span>
      </div>
    </div>
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-1">Display title</label>
      <input v-model="form.displayTitle" type="text" class="input-field">
    </div>
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-1">Bio</label>
      <textarea v-model="form.bio" rows="3" class="input-field resize-none" />
    </div>
    <div>
      <label class="block text-sm text-[var(--text-muted)] mb-1">Layout density</label>
      <select v-model="form.density" class="input-field">
        <option value="compact">Compact</option>
        <option value="normal">Normal</option>
        <option value="spacious">Spacious</option>
      </select>
    </div>
    <label class="flex items-center gap-2 cursor-pointer">
      <input v-model="form.isPublic" type="checkbox" class="rounded accent-[var(--accent)]">
      <span class="text-sm">Public gallery</span>
    </label>
    <button type="submit" class="btn-primary w-full sm:w-auto">
      Save changes
    </button>
  </form>
</template>

<script setup lang="ts">
import type { AuthUser } from '~/shared/types'

const props = defineProps<{ profile: AuthUser }>()
const emit = defineEmits<{ saved: [] }>()

const { apiFetch } = useAuth()

const form = reactive({
  username: props.profile.username || '',
  displayTitle: props.profile.displayTitle || '',
  bio: props.profile.bio || '',
  density: 'normal' as 'compact' | 'normal' | 'spacious',
  isPublic: props.profile.isPublic,
})

const usernameStatus = ref<'idle' | 'ok' | 'taken'>('idle')

let checkTimer: ReturnType<typeof setTimeout>
watch(
  () => form.username,
  (v) => {
    clearTimeout(checkTimer)
    usernameStatus.value = 'idle'
    if (!v || v === props.profile.username) return
    checkTimer = setTimeout(async () => {
      const res = await apiFetch<{ available: boolean }>('/api/profiles/check-username', {
        method: 'POST',
        body: { username: v },
      })
      usernameStatus.value = res.available ? 'ok' : 'taken'
    }, 400)
  },
)

async function save() {
  await apiFetch('/api/profile', {
    method: 'PATCH',
    body: {
      username: form.username,
      displayTitle: form.displayTitle,
      bio: form.bio,
      isPublic: form.isPublic,
      theme: { density: form.density },
    },
  })
  emit('saved')
}
</script>
