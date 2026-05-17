<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup lang="ts">
const { initAuthListener } = useAuth()
onMounted(() => initAuthListener())
</script>
