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
import { signInWithRedirect } from 'firebase/auth'
import { isOAuthReturnFromGoogle } from '~/shared/auth-bridge'

/**
 * Firebase redirect OAuth lands here (before and after Google).
 * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
definePageMeta({ layout: false })

const { $firebaseAuth, $googleProvider } = useNuxtApp()
const { status, error, completePendingRedirect } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth || !$googleProvider) {
    error.value = 'Firebase is not configured.'
    return
  }

  const authType = new URLSearchParams(window.location.search).get('authType')

  if (authType === 'signInViaPopup') {
    error.value = 'Popup sign-in did not finish. Close this tab, open the app, and try again.'
    status.value = ''
    window.setTimeout(() => window.location.replace('/auth/mobile'), 2500)
    return
  }

  try {
    status.value = 'Finishing sign-in…'
    const done = await completePendingRedirect($firebaseAuth)
    if (done) {
      sessionStorage.removeItem('lg-oauth-handler-tried')
      return
    }

    // Pre-Google hop (your URL shape) — continue to Google; not an error yet.
    if (authType === 'signInViaRedirect' && !isOAuthReturnFromGoogle()) {
      status.value = 'Redirecting to Google…'
      await signInWithRedirect($firebaseAuth, $googleProvider)
      return
    }

    error.value =
      'Could not complete sign-in. Add https://loopgallery.a-u.us/__/auth/handler to Google OAuth redirect URIs, then try again from the app.'
    status.value = ''
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = ''
  }
})
</script>
