<script setup lang="ts">
definePageMeta({ middleware: 'auth' })

const { profile } = useAuth()
const { navigateToManageProfile } = useProfileUrl()

watch(
  profile,
  (p) => {
    if (p?.username) {
      navigateToManageProfile(p.username)
    }
  },
  { immediate: true },
)
</script>

<template>
  <div class="text-center py-20 text-[var(--text-muted)]">
    Opening your gallery…
  </div>
</template>
