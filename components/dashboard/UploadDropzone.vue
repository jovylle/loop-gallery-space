<template>
  <div
    class="surface-card border-2 border-dashed border-white/10 p-10 text-center transition-colors"
    :class="{ 'border-accent/50 bg-accent/5': dragging }"
    @dragover.prevent="dragging = true"
    @dragleave="dragging = false"
    @drop.prevent="onDrop"
  >
    <input
      ref="inputRef"
      type="file"
      accept="image/*,video/mp4,video/webm"
      multiple
      class="hidden"
      @change="onSelect"
    >
    <p class="text-[var(--text-muted)] mb-4">
      Drop images or short loops here, or
    </p>
    <button type="button" class="btn-primary" :disabled="uploading" @click="inputRef?.click()">
      {{ uploading ? 'Uploading…' : 'Choose files' }}
    </button>
    <p v-if="error" class="mt-3 text-sm text-red-400">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{ uploaded: [] }>()
const { uploadFile } = useUpload()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)
const uploading = ref(false)
const error = ref('')

async function processFiles(files: FileList | File[]) {
  error.value = ''
  uploading.value = true
  try {
    for (const file of Array.from(files)) {
      await uploadFile(file)
    }
    emit('uploaded')
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Upload failed'
  }
  finally {
    uploading.value = false
    dragging.value = false
  }
}

function onDrop(e: DragEvent) {
  if (e.dataTransfer?.files.length) processFiles(e.dataTransfer.files)
}

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) processFiles(input.files)
  input.value = ''
}
</script>
