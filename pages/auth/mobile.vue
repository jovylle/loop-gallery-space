<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Sign in
    </p>
    <h1 class="text-2xl font-semibold mb-2">
      Continue with Google
    </h1>
    <p class="text-[var(--text-muted)] text-sm max-w-sm mb-6">
      {{ status }}
    </p>
    <p v-if="error" class="text-red-400 text-sm max-w-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { signInWithRedirect } from 'firebase/auth'
import { isFirebaseRedirectReturn } from '~/shared/auth-bridge'

definePageMeta({ layout: false })

const { $firebaseAuth, $googleProvider } = useNuxtApp()
const { status, error, completePendingRedirect } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth || !$googleProvider) {
    error.value = 'Firebase is not configured.'
    return
  }

  try {
    const done = await completePendingRedirect($firebaseAuth)
    if (done) return

    // Google returned but tokens were not applied — send through Firebase handler (proxied on our domain).
    if (isFirebaseRedirectReturn()) {
      window.location.replace(`/__/auth/handler${window.location.search}${window.location.hash}`)
      return
    }

    status.value = 'Redirecting to Google…'
    await signInWithRedirect($firebaseAuth, $googleProvider)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = 'Something went wrong.'
  }
})
</script>
