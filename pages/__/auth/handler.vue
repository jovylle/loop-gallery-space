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
 * Firebase returns here after Google. Only finish redirect — never start it again.
 */
definePageMeta({ layout: false })

const OAUTH_SESSION_KEY = 'lg-oauth-session'

const { $firebaseAuth } = useNuxtApp()
const { status, error, completePendingRedirect } = useOAuthRedirectFinish()

onMounted(async () => {
  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    return
  }

  const authType = new URLSearchParams(window.location.search).get('authType')
  if (authType === 'signInViaPopup') {
    error.value = 'Popup sign-in did not finish. Close this tab, open the app, and try again.'
    status.value = ''
    return
  }

  try {
    status.value = 'Finishing sign-in…'
    const done = await completePendingRedirect($firebaseAuth)
    if (done) {
      sessionStorage.removeItem(OAUTH_SESSION_KEY)
      return
    }

    error.value =
      'Could not complete sign-in. Close this tab, open the app, and try again.'
    status.value = ''
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = ''
  }
})
</script>
