<template>
  <div class="surface-card p-4 text-sm">
    <p class="text-[var(--text-muted)] mb-3">
      <span class="text-[var(--text-primary)] font-medium">Your limits</span>
      — built into Loop Gallery to keep the free tier sustainable.
    </p>

    <ul v-if="!usage" class="text-[var(--text-muted)] space-y-1">
      <li>{{ uploadsPerDay }} uploads per day (rolling 24h)</li>
      <li>{{ itemMax }} items per gallery</li>
      <li>{{ storageMaxLabel }} storage per account</li>
      <li>{{ maxMb }} MB max per file</li>
    </ul>

    <ul v-else class="space-y-3">
      <li>
        <div class="flex justify-between gap-2 mb-1">
          <span class="text-[var(--text-muted)]">Uploads today</span>
          <span :class="uploadsTodayClass">
            {{ usage.uploadsToday }} / {{ usage.uploadsPerDayMax }}
          </span>
        </div>
        <div class="h-1.5 rounded-full bg-[var(--surface-hover)] overflow-hidden">
          <div
            class="h-full transition-all"
            :class="uploadsBarClass"
            :style="{ width: `${uploadsPercent}%` }"
          />
        </div>
        <p v-if="uploadsRemaining === 0" class="mt-1 text-xs text-amber-400">
          Daily limit reached — try again tomorrow.
        </p>
      </li>
      <li>
        <div class="flex justify-between gap-2 mb-1">
          <span class="text-[var(--text-muted)]">Gallery items</span>
          <span class="text-[var(--text-primary)]">{{ usage.itemCount }} / {{ usage.itemMax }}</span>
        </div>
        <div class="h-1.5 rounded-full bg-[var(--surface-hover)] overflow-hidden">
          <div
            class="h-full bg-accent/70 transition-all"
            :style="{ width: `${itemsPercent}%` }"
          />
        </div>
      </li>
      <li>
        <div class="flex justify-between gap-2 mb-1">
          <span class="text-[var(--text-muted)]">Storage</span>
          <span class="text-[var(--text-primary)]">
            {{ formatBytes(usage.storageBytes) }} / {{ formatBytes(usage.storageMax) }}
          </span>
        </div>
        <div class="h-1.5 rounded-full bg-[var(--surface-hover)] overflow-hidden">
          <div
            class="h-full bg-accent/70 transition-all"
            :style="{ width: `${storagePercent}%` }"
          />
        </div>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { QuotaUsage } from '~/shared/types'
import { QUOTAS } from '~/shared/constants'
import { formatBytes } from '~/shared/format-bytes'

const props = defineProps<{
  usage?: QuotaUsage | null
}>()

const { uploadsRemaining: remaining } = useQuota()

const uploadsPerDay = QUOTAS.maxUploadsPerDay
const itemMax = QUOTAS.maxItemsPerGallery
const maxMb = QUOTAS.maxUploadBytes / 1024 / 1024
const storageMaxLabel = `${QUOTAS.maxStorageBytes / 1024 / 1024} MB`

const uploadsRemaining = computed(() =>
  props.usage ? remaining(props.usage) : uploadsPerDay,
)

function percent(used: number, max: number) {
  if (max <= 0) return 0
  return Math.min(100, Math.round((used / max) * 100))
}

const uploadsPercent = computed(() =>
  props.usage ? percent(props.usage.uploadsToday, props.usage.uploadsPerDayMax) : 0,
)
const itemsPercent = computed(() =>
  props.usage ? percent(props.usage.itemCount, props.usage.itemMax) : 0,
)
const storagePercent = computed(() =>
  props.usage ? percent(props.usage.storageBytes, props.usage.storageMax) : 0,
)

const uploadsTodayClass = computed(() => {
  if (!props.usage) return 'text-[var(--text-primary)]'
  if (uploadsRemaining.value === 0) return 'text-amber-400 font-medium'
  if (uploadsRemaining.value <= 3) return 'text-amber-300'
  return 'text-[var(--text-primary)]'
})

const uploadsBarClass = computed(() => {
  if (!props.usage) return 'bg-accent/70'
  if (uploadsRemaining.value === 0) return 'bg-amber-500'
  if (uploadsRemaining.value <= 3) return 'bg-amber-400/80'
  return 'bg-accent/70'
})
</script>
