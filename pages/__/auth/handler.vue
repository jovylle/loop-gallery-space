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
 * Firebase lands here after Google OAuth. Must call getRedirectResult on this URL.
 */
definePageMeta({ layout: false })

const { $firebaseAuth } = useNuxtApp()
const { status, error, completePendingRedirect } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    return
  }

  const authType = new URLSearchParams(window.location.search).get('authType')

  // Leftover popup flow (blocked in Custom Tab) — cannot finish on this URL.
  if (authType === 'signInViaPopup') {
    error.value = 'Popup sign-in did not finish. Close this tab, open the app, and try again.'
    status.value = ''
    window.setTimeout(() => {
      window.location.replace('/auth/mobile')
    }, 2500)
    return
  }

  try {
    status.value = 'Finishing sign-in…'
    const done = await completePendingRedirect($firebaseAuth)
    if (done) {
      sessionStorage.removeItem('lg-oauth-handler-tried')
      return
    }

    error.value = 'Could not complete sign-in. Close this tab and try again from the app.'
    status.value = ''
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = ''
  }
})
</script>
