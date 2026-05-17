<template>
  <div
    v-if="itemCount > 0"
    class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6"
  >
    <p class="text-sm text-[var(--text-muted)]">
      {{ itemCount }} {{ itemCount === 1 ? 'item' : 'items' }}
    </p>
    <div class="flex flex-col gap-3 w-full min-w-0 sm:w-auto sm:flex-row sm:items-center sm:gap-3">
      <div
        class="min-w-0 -mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto overscroll-x-contain"
        style="-webkit-overflow-scrolling: touch"
      >
        <div
          class="inline-flex flex-nowrap p-1 rounded-full border border-[var(--border-strong)] bg-[var(--surface-hover)]"
          role="group"
          aria-label="View mode"
        >
          <button
            v-for="mode in GALLERY_VIEW_MODES"
            :key="mode.id"
            type="button"
            class="shrink-0 whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
            :class="viewMode === mode.id
              ? 'bg-accent text-white shadow-glow'
              : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'"
            :aria-pressed="viewMode === mode.id"
            :title="mode.label"
            @click="viewMode = mode.id"
          >
            {{ mode.label }}
          </button>
        </div>
      </div>
      <label class="flex items-center gap-2 text-sm text-[var(--text-muted)] shrink-0">
        <span class="sr-only sm:not-sr-only">Sort</span>
        <select
          v-model="sortMode"
          class="input-field py-1.5 text-sm w-full sm:w-auto sm:min-w-[9rem]"
        >
          <option
            v-for="opt in GALLERY_SORT_OPTIONS"
            :key="opt.id"
            :value="opt.id"
          >
            {{ opt.label }}
          </option>
        </select>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  GALLERY_SORT_OPTIONS,
  GALLERY_VIEW_MODES,
  type GallerySortMode,
  type GalleryViewMode,
} from '~/shared/gallery-view'

defineProps<{ itemCount: number }>()

const viewMode = defineModel<GalleryViewMode>('viewMode', { required: true })
const sortMode = defineModel<GallerySortMode>('sortMode', { required: true })
</script>
