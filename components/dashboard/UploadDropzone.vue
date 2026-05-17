<template>
  <div>
    <div
      class="surface-card border-2 border-dashed border-white/10 p-10 text-center transition-colors"
      :class="{
        'border-accent/50 bg-accent/5': dragging,
        'opacity-60 pointer-events-none': busy,
      }"
      @dragenter.prevent="onDragEnter"
      @dragover.prevent
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="inputRef"
        type="file"
        accept="image/*,video/mp4,video/webm"
        multiple
        class="hidden"
        :disabled="busy"
        @change="onSelect"
      >
      <p class="text-[var(--text-muted)] mb-1">
        Drop images or short loops here, or
      </p>
      <p class="text-xs text-[var(--text-muted)] mb-4">
        Up to {{ maxMb }} MB each · batch upload supported
      </p>
      <button type="button" class="btn-primary" :disabled="busy" @click="inputRef?.click()">
        {{ busy ? progressLabel : 'Choose files' }}
      </button>
      <p v-if="summary && !busy" class="mt-3 text-sm" :class="summary.failed ? 'text-amber-400' : 'text-green-400'">
        {{ summary.text }}
        <button type="button" class="ml-2 underline text-[var(--text-muted)] hover:text-[var(--text-primary)]" @click="clearQueue">
          Dismiss
        </button>
      </p>
      <p v-else-if="error && !busy" class="mt-3 text-sm text-red-400">{{ error }}</p>
    </div>

    <div v-if="queue.length" class="mt-4 surface-card p-4">
      <div class="flex items-center justify-between gap-3 mb-3 text-sm">
        <span class="text-[var(--text-muted)]">
          {{ doneCount }} / {{ queue.length }} complete
        </span>
        <span v-if="busy" class="text-accent font-medium">{{ progressLabel }}</span>
      </div>
      <div class="h-1.5 rounded-full bg-white/10 overflow-hidden mb-4">
        <div
          class="h-full bg-accent transition-all duration-300"
          :style="{ width: `${progressPercent}%` }"
        />
      </div>
      <ul class="max-h-64 overflow-y-auto space-y-2 pr-1">
        <li
          v-for="entry in queue"
          :key="entry.id"
          class="flex items-center gap-3 text-sm rounded-xl px-2 py-1.5"
          :class="entry.status === 'error' ? 'bg-red-500/10' : 'bg-white/[0.03]'"
        >
          <div class="w-10 h-10 rounded-lg overflow-hidden bg-black/30 shrink-0 flex items-center justify-center">
            <img
              v-if="entry.previewUrl"
              :src="entry.previewUrl"
              alt=""
              class="w-full h-full object-cover"
            >
            <span v-else class="text-[10px] text-[var(--text-muted)] uppercase">
              {{ entry.file.type.startsWith('video/') ? 'vid' : 'file' }}
            </span>
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate text-[var(--text-primary)]">{{ entry.file.name }}</p>
            <p v-if="entry.error" class="truncate text-xs text-red-400">{{ entry.error }}</p>
          </div>
          <span
            class="shrink-0 text-xs font-medium"
            :class="statusClass(entry.status)"
          >
            {{ statusLabel(entry.status) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { QUOTAS } from '~/shared/constants'

type QueueStatus = 'queued' | 'uploading' | 'done' | 'error'

type QueueEntry = {
  id: string
  file: File
  previewUrl: string | null
  status: QueueStatus
  error?: string
}

const emit = defineEmits<{ uploaded: [] }>()
const { uploadMany } = useUpload()

const inputRef = ref<HTMLInputElement>()
const dragging = ref(false)
const dragDepth = ref(0)
const busy = ref(false)
const error = ref('')
const summary = ref<{ text: string; failed: number } | null>(null)
const queue = ref<QueueEntry[]>([])

const maxMb = QUOTAS.maxUploadBytes / 1024 / 1024

const doneCount = computed(() =>
  queue.value.filter(e => e.status === 'done' || e.status === 'error').length,
)

const progressPercent = computed(() =>
  queue.value.length ? Math.round((doneCount.value / queue.value.length) * 100) : 0,
)

const progressLabel = computed(() => {
  if (!queue.value.length) return 'Uploading…'
  const inFlight = queue.value.filter(e => e.status === 'uploading').length
  return `Uploading ${doneCount.value + inFlight} of ${queue.value.length}…`
})

function statusLabel(status: QueueStatus) {
  switch (status) {
    case 'queued': return 'Queued'
    case 'uploading': return 'Uploading'
    case 'done': return 'Done'
    case 'error': return 'Failed'
  }
}

function statusClass(status: QueueStatus) {
  switch (status) {
    case 'queued': return 'text-[var(--text-muted)]'
    case 'uploading': return 'text-accent'
    case 'done': return 'text-green-400'
    case 'error': return 'text-red-400'
  }
}

function isAccepted(file: File) {
  if (file.type.startsWith('image/')) return true
  return file.type === 'video/mp4' || file.type === 'video/webm'
}

function previewFor(file: File): string | null {
  if (!file.type.startsWith('image/')) return null
  return URL.createObjectURL(file)
}

function revokePreviews(entries: QueueEntry[]) {
  for (const e of entries) {
    if (e.previewUrl) URL.revokeObjectURL(e.previewUrl)
  }
}

function clearQueue() {
  revokePreviews(queue.value)
  queue.value = []
  summary.value = null
  error.value = ''
}

function findEntry(file: File) {
  return queue.value.find(e => e.file === file)
}

async function processFiles(files: FileList | File[]) {
  error.value = ''
  summary.value = null

  const accepted: File[] = []
  const skipped: string[] = []
  for (const file of Array.from(files)) {
    if (isAccepted(file)) accepted.push(file)
    else skipped.push(file.name)
  }

  if (!accepted.length) {
    error.value = skipped.length
      ? 'No supported files (images or MP4/WebM video only).'
      : 'No files selected.'
    return
  }

  if (skipped.length) {
    error.value = `Skipped ${skipped.length} unsupported file(s).`
  }

  revokePreviews(queue.value)
  queue.value = accepted.map(file => ({
    id: crypto.randomUUID(),
    file,
    previewUrl: previewFor(file),
    status: 'queued' as const,
  }))

  busy.value = true
  try {
    const result = await uploadMany(accepted, {
      concurrency: 3,
      onFileStart(file) {
        const entry = findEntry(file)
        if (entry) entry.status = 'uploading'
      },
      onFileComplete(file, err) {
        const entry = findEntry(file)
        if (!entry) return
        if (err) {
          entry.status = 'error'
          entry.error = err.message
        }
        else {
          entry.status = 'done'
          emit('uploaded')
        }
      },
    })

    const parts: string[] = []
    if (result.succeeded) parts.push(`${result.succeeded} uploaded`)
    if (result.failed) parts.push(`${result.failed} failed`)
    summary.value = {
      text: parts.join(' · ') || 'Nothing uploaded',
      failed: result.failed,
    }
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Upload failed'
  }
  finally {
    busy.value = false
    dragging.value = false
    dragDepth.value = 0
    if (inputRef.value) inputRef.value.value = ''
  }
}

function onDragEnter() {
  dragDepth.value++
  dragging.value = true
}

function onDragLeave() {
  dragDepth.value = Math.max(0, dragDepth.value - 1)
  dragging.value = dragDepth.value > 0
}

function onDrop(e: DragEvent) {
  dragDepth.value = 0
  dragging.value = false
  if (e.dataTransfer?.files.length) processFiles(e.dataTransfer.files)
}

function onSelect(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length) processFiles(input.files)
}

onBeforeUnmount(() => revokePreviews(queue.value))
</script>
