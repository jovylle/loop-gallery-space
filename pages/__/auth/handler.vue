<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Sign in
    </p>
    <h1 class="text-2xl font-semibold mb-2">
      Completing sign-in
    </h1>
    <p class="text-[var(--text-muted)] text-sm max-w-sm mb-4">
      {{ status }}
    </p>
    <p v-if="error" class="text-red-400 text-sm max-w-sm mb-4">{{ error }}</p>
    <AuthDebugPanel />
  </div>
</template>

<script setup lang="ts">
import { isFirebaseRedirectReturn, isOAuthReturnFromGoogle } from '~/shared/auth-bridge'

definePageMeta({ layout: false })

const OAUTH_SESSION_KEY = 'lg-oauth-session'

const { $firebaseAuth } = useNuxtApp()
const { status, error, completePendingRedirect, debug } = useOAuthRedirectFinish('handler')

onMounted(async () => {
  debug.clear()
  debug.log('handler mounted')
  debug.snapshotUrl()
  debug.snapshotOAuthQuery()
  debug.snapshotClient()
  debug.snapshotFirebase()
  debug.log(`isFirebaseRedirectReturn: ${isFirebaseRedirectReturn()}`)
  debug.log(`isOAuthReturnFromGoogle: ${isOAuthReturnFromGoogle()}`)

  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    debug.log('FAIL: no $firebaseAuth')
    return
  }

  const authType = new URLSearchParams(window.location.search).get('authType')
  debug.log(`authType: ${authType ?? '(none)'}`)

  if (authType === 'signInViaPopup') {
    error.value = 'Popup sign-in did not finish. Close this tab, open the app, and try again.'
    status.value = ''
    debug.log('FAIL: signInViaPopup in Custom Tab')
    return
  }

  try {
    status.value = 'Finishing sign-in…'
    const done = await completePendingRedirect($firebaseAuth)
    if (done) {
      sessionStorage.removeItem(OAUTH_SESSION_KEY)
      debug.log('SUCCESS: redirecting to /auth/complete')
      return
    }

    error.value =
      'Could not complete sign-in. Close this tab, open the app, and try again.'
    status.value = ''
    debug.log('FAIL: getRedirectResult returned no user')
    debug.log('hint: check Google OAuth redirect URI includes /__/auth/handler on loopgallery.a-u.us')
  }
  catch (e) {
    error.value = debug.firebaseError(e)
    status.value = ''
    debug.log(`FAIL: exception ${debug.firebaseError(e)}`)
  }
})
</script>
