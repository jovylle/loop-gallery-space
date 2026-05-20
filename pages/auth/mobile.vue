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
    if (done) {
      sessionStorage.removeItem('lg-oauth-handler-tried')
      return
    }

    const q = window.location.search
    const h = window.location.hash
    const params = new URLSearchParams(q.startsWith('?') ? q.slice(1) : q)

    // Google returned on /auth/mobile — finish on /__/auth/handler (once).
    if (isFirebaseRedirectReturn()) {
      if (params.get('authType') === 'signInViaPopup') {
        sessionStorage.removeItem('lg-oauth-handler-tried')
        window.location.replace('/auth/mobile')
        return
      }
      if (sessionStorage.getItem('lg-oauth-handler-tried') === '1') {
        error.value = 'Sign-in could not finish. Close this tab, open the app, and try again.'
        status.value = ''
        return
      }
      sessionStorage.setItem('lg-oauth-handler-tried', '1')
      window.location.replace(`/__/auth/handler${q}${h}`)
      return
    }

    sessionStorage.removeItem('lg-oauth-handler-tried')
    status.value = 'Redirecting to Google…'
    await signInWithRedirect($firebaseAuth, $googleProvider)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = 'Something went wrong.'
  }
})
</script>
