<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Sign in
    </p>
    <h1 class="text-2xl font-semibold mb-2">
      Completing sign-in
    </h1>
    <p class="text-[var(--text-muted)] text-sm max-w-sm mb-6">
      {{ status }}
    </p>
    <p v-if="error" class="text-red-400 text-sm max-w-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
/**
 * Firebase redirect OAuth lands here after Google (not on /auth/mobile).
 * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
definePageMeta({ layout: false })

const { $firebaseAuth } = useNuxtApp()
const { status, error, completePendingRedirect } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    return
  }

  try {
    const done = await completePendingRedirect($firebaseAuth)
    if (done) return

    error.value = 'No sign-in session found. Please try again from the app.'
    status.value = ''
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = 'Something went wrong.'
  }
})
</script>
