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
import { signInWithPopup } from 'firebase/auth'
import { isFirebaseRedirectReturn } from '~/shared/auth-bridge'

definePageMeta({ layout: false })

const { $firebaseAuth, $googleProvider } = useNuxtApp()
const { status, error, completePendingRedirect, finishWithOAuthCredential } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth || !$googleProvider) {
    error.value = 'Firebase is not configured.'
    return
  }

  // Stale redirect return on the wrong path — forward to Firebase handler (avoid redirect loop).
  if (isFirebaseRedirectReturn()) {
    window.location.replace(`/__/auth/handler${window.location.search}${window.location.hash}`)
    return
  }

  try {
    const existing = await completePendingRedirect($firebaseAuth)
    if (existing) return

    // Custom Tab is real Chrome — popup avoids cross-domain redirect / getRedirectResult failures.
    status.value = 'Opening Google…'
    const result = await signInWithPopup($firebaseAuth, $googleProvider)
    await finishWithOAuthCredential(result)
  }
  catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : ''
    if (code === 'auth/popup-blocked' || code === 'auth/cancelled-popup-request') {
      error.value = 'Google sign-in was blocked. Allow popups and try again.'
    }
    else {
      error.value = e instanceof Error ? e.message : 'Sign in failed'
    }
    status.value = 'Something went wrong.'
  }
})
</script>
