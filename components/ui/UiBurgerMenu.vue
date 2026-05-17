<template>
  <div ref="menuRoot" class="relative" :class="$attrs.class">
    <button
      type="button"
      class="btn-ghost p-2 sm:px-3"
      :aria-expanded="open"
      aria-haspopup="menu"
      :aria-label="label"
      @click="open = !open"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1.75"
        class="w-5 h-5"
        aria-hidden="true"
      >
        <path stroke-linecap="round" d="M4 7h16M4 12h16M4 17h16" />
      </svg>
    </button>
    <div
      v-if="open"
      role="menu"
      class="absolute right-0 top-full mt-1 min-w-[10rem] py-1 rounded-xl border border-[var(--border-strong)] bg-[var(--bg-elevated)] shadow-soft z-50"
    >
      <slot :close="closeMenu" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ inheritAttrs: false })

withDefaults(
  defineProps<{
    label?: string
  }>(),
  { label: 'Menu' },
)

const open = ref(false)
const menuRoot = ref<HTMLElement | null>(null)

function closeMenu() {
  open.value = false
}

function onDocClick(event: MouseEvent) {
  if (!open.value || !menuRoot.value) return
  if (!menuRoot.value.contains(event.target as Node)) open.value = false
}

function onDocKey(event: KeyboardEvent) {
  if (event.key === 'Escape') open.value = false
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  document.addEventListener('keydown', onDocKey)
})

onUnmounted(() => {
  document.removeEventListener('click', onDocClick)
  document.removeEventListener('keydown', onDocKey)
})
</script>

<style scoped>
[role='menu'] :slotted(a),
[role='menu'] :slotted(button) {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  text-align: left;
  color: var(--text-primary);
  transition: background-color 0.2s;
}

[role='menu'] :slotted(a:hover),
[role='menu'] :slotted(button:hover) {
  background-color: var(--surface-hover);
}
</style>
