<template>
  <button
    type="button"
    class="btn-ghost p-2 sm:px-3"
    :aria-label="ariaLabel"
    :title="ariaLabel"
    @click="toggle"
  >
    <svg
      v-if="colorMode.value === 'dark'"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      class="w-5 h-5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path
        stroke-linecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
    <svg
      v-else
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.75"
      class="w-5 h-5"
      aria-hidden="true"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z"
      />
    </svg>
    <span class="sr-only">{{ ariaLabel }}</span>
  </button>
</template>

<script setup lang="ts">
const colorMode = useColorMode()

const ariaLabel = computed(() =>
  colorMode.value === 'dark' ? 'Switch to light mode' : 'Switch to dark mode',
)

function toggle() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>
