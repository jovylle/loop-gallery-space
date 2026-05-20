<template>
  <div
    class="mt-6 w-full max-w-lg mx-auto text-left border border-amber-500/40 rounded-lg bg-black/40 overflow-hidden"
  >
    <p class="px-3 py-2 text-xs font-mono text-amber-400 border-b border-amber-500/30 uppercase tracking-wider">
      Auth debug
    </p>
    <ol class="max-h-64 overflow-y-auto px-3 py-2 space-y-1 text-[11px] font-mono text-[var(--text-muted)] leading-relaxed">
      <li v-for="(line, i) in lines" :key="i" class="break-all">
        {{ line }}
      </li>
      <li v-if="!lines.length" class="text-amber-400/80">
        (waiting for logs…)
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
const lines = useState<string[]>('auth-debug-lines', () => [])
</script>
