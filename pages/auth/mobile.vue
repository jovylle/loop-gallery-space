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

definePageMeta({ layout: false })

const OAUTH_SESSION_KEY = 'lg-oauth-session'

const { $firebaseAuth, $googleProvider } = useNuxtApp()
const { status, error, completePendingRedirect } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth || !$googleProvider) {
    error.value = 'Firebase is not configured.'
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
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = 'Something went wrong.'
  }
})
</script>
