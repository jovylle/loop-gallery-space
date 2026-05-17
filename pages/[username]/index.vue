<template>
  <GalleryProfileView :username="username" />
</template>

<script setup lang="ts">
const route = useRoute()
const username = computed(() => String(route.params.username).toLowerCase())
</script>
