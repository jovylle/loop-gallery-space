<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Sign in
    </p>
    <h1 class="text-2xl font-semibold mb-2">
      Continue with Google
    </h1>
    <p class="text-[var(--text-muted)] text-sm max-w-sm mb-4">
      {{ status }}
    </p>
    <p v-if="error" class="text-red-400 text-sm max-w-sm mb-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { signInWithRedirect } from 'firebase/auth'
import { OAUTH_MOBILE_SESSION_KEY } from '~/shared/auth-bridge'

definePageMeta({ layout: false })

const OAUTH_SESSION_KEY = OAUTH_MOBILE_SESSION_KEY

const { $firebaseAuth, $googleProvider } = useNuxtApp()
const { status, error, completePendingRedirect, formatFirebaseError } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth || !$googleProvider) {
    error.value = 'Firebase is not configured.'
    return
  }

  const { isCapacitorNative } = useCapacitor()
  // OAuth must run in Chrome Custom Tab (no Capacitor bridge). Emulator/in-app loads can land here in the WebView.
  if (isCapacitorNative()) {
    status.value = 'Opening sign-in in Chrome…'
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: `${window.location.origin}/auth/mobile` })
    status.value = 'Continue in the Chrome tab…'
    return
  }

  try {
    const done = await completePendingRedirect($firebaseAuth)
    if (done) {
      sessionStorage.removeItem(OAUTH_SESSION_KEY)
      return
    }

    if (sessionStorage.getItem(OAUTH_SESSION_KEY) === '1') {
      error.value = 'Sign-in did not finish. Close this tab, open the app, and try again.'
      status.value = ''
      return
    }

    sessionStorage.setItem(OAUTH_SESSION_KEY, '1')
    status.value = 'Redirecting to Google…'
    await signInWithRedirect($firebaseAuth, $googleProvider)
  }
  catch (e) {
    sessionStorage.removeItem(OAUTH_SESSION_KEY)
    error.value = formatFirebaseError(e)
    status.value = 'Something went wrong.'
  }
})
</script>
