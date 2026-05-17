<template>
  <section class="surface-card p-6 space-y-5">
    <div class="flex items-start gap-5">
      <div
        class="w-20 h-20 rounded-full ring-2 ring-accent/40 overflow-hidden bg-elevated shrink-0"
      >
        <img
          v-if="previewUrl"
          :src="previewUrl"
          alt=""
          class="w-full h-full object-cover"
        >
      </div>
      <div>
        <h2 class="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wide">
          Avatar
        </h2>
        <p class="text-sm text-[var(--text-muted)] mt-1">
          Pick a thumb character or upload your own photo.
        </p>
      </div>
    </div>

    <div>
      <p class="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wide">
        Thumb characters
      </p>
      <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
        <button
          v-for="preset in AVATAR_THUMB_PRESETS"
          :key="preset.id"
          type="button"
          class="relative aspect-square rounded-xl overflow-hidden ring-2 transition focus:outline-none focus-visible:ring-accent"
          :class="
            isPresetActive(preset)
              ? 'ring-accent shadow-lg shadow-accent/20'
              : 'ring-transparent hover:ring-white/20'
          "
          :disabled="saving"
          :title="`Use ${preset.seed} avatar`"
          @click="selectPreset(preset)"
        >
          <img
            :src="avatarPresetUrl(preset, 96)"
            alt=""
            class="w-full h-full object-cover bg-elevated"
            loading="lazy"
          >
        </button>
      </div>
    </div>

    <div class="flex flex-wrap items-center gap-3 pt-1">
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        class="hidden"
        @change="onUpload"
      >
      <button
        type="button"
        class="btn-ghost"
        :disabled="saving || uploading"
        @click="fileInput?.click()"
      >
        {{ uploading ? 'Uploading…' : 'Upload photo' }}
      </button>
      <span
        v-if="hasCustomUpload"
        class="text-xs text-[var(--text-muted)]"
      >
        Using your uploaded photo
      </span>
      <span v-if="saving && !uploading" class="text-xs text-[var(--text-muted)]">
        Saving…
      </span>
    </div>
  </section>
</template>

<script setup lang="ts">
import {
  AVATAR_THUMB_PRESETS,
  avatarPresetKey,
  avatarPresetUrl,
  dicebearThumbIdentity,
  isUploadedAvatarKey,
} from '~/shared/avatars'
import type { AuthUser } from '~/shared/types'

const props = defineProps<{ profile: AuthUser }>()
const emit = defineEmits<{ updated: [] }>()

const { apiFetch, refreshProfile } = useAuth()
const { uploadFile } = useUpload()

const fileInput = ref<HTMLInputElement>()
const saving = ref(false)
const uploading = ref(false)

const previewUrl = computed(() => props.profile.avatarUrl)

const currentIdentity = computed(() => dicebearThumbIdentity(props.profile.avatarKey))

const hasCustomUpload = computed(() => isUploadedAvatarKey(props.profile.avatarKey))

function isPresetActive(preset: (typeof AVATAR_THUMB_PRESETS)[number]) {
  if (hasCustomUpload.value) return false
  return currentIdentity.value === dicebearThumbIdentity(avatarPresetKey(preset))
}

async function setAvatarKey(avatarKey: string) {
  saving.value = true
  try {
    await apiFetch('/api/profile', {
      method: 'PATCH',
      body: { avatarKey },
    })
    await refreshProfile()
    emit('updated')
  }
  finally {
    saving.value = false
  }
}

async function selectPreset(preset: (typeof AVATAR_THUMB_PRESETS)[number]) {
  if (isPresetActive(preset)) return
  await setAvatarKey(avatarPresetKey(preset))
}

async function onUpload(e: Event) {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (!file) return
  uploading.value = true
  try {
    await uploadFile(file, { kind: 'avatar' })
    await refreshProfile()
    emit('updated')
  }
  finally {
    uploading.value = false
    if (fileInput.value) fileInput.value.value = ''
  }
}
</script>
