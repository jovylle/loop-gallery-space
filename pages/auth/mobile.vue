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
    <AuthDebugPanel />
  </div>
</template>

<script setup lang="ts">
import { signInWithRedirect } from 'firebase/auth'
import { isFirebaseRedirectReturn, isOAuthReturnFromGoogle } from '~/shared/auth-bridge'

definePageMeta({ layout: false })

const OAUTH_SESSION_KEY = 'lg-oauth-session'

const { $firebaseAuth, $googleProvider } = useNuxtApp()
const { status, error, completePendingRedirect, debug } = useOAuthRedirectFinish('mobile')

onMounted(async () => {
  debug.clear()
  debug.log('mobile mounted')
  debug.snapshotUrl()
  debug.snapshotOAuthQuery()
  debug.snapshotClient()
  debug.snapshotFirebase()
  debug.log(`isFirebaseRedirectReturn: ${isFirebaseRedirectReturn()}`)
  debug.log(`isOAuthReturnFromGoogle: ${isOAuthReturnFromGoogle()}`)

  if (!$firebaseAuth || !$googleProvider) {
    error.value = 'Firebase is not configured.'
    debug.log('FAIL: firebase not configured')
    return
  }

  const { isCapacitorNative } = useCapacitor()
  // OAuth must run in Chrome Custom Tab (no Capacitor bridge). Emulator/in-app loads can land here in the WebView.
  if (isCapacitorNative()) {
    status.value = 'Opening sign-in in Chrome…'
    debug.log('WebView detected → opening Custom Tab for /auth/mobile')
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: `${window.location.origin}/auth/mobile` })
    status.value = 'Continue in the Chrome tab…'
    return
  }

  try {
    const done = await completePendingRedirect($firebaseAuth)
    if (done) {
      sessionStorage.removeItem(OAUTH_SESSION_KEY)
      debug.log('SUCCESS: already had redirect result')
      return
    }

    if (sessionStorage.getItem(OAUTH_SESSION_KEY) === '1') {
      error.value = 'Sign-in did not finish. Close this tab, open the app, and try again.'
      status.value = ''
      debug.log('FAIL: lg-oauth-session=1 but no redirect result (stale session?)')
      debug.log('hint: clear site data / close tab and retry from app')
      return
    }

    sessionStorage.setItem(OAUTH_SESSION_KEY, '1')
    status.value = 'Redirecting to Google…'
    debug.log('calling signInWithRedirect → expect Google then /__/auth/handler')
    await signInWithRedirect($firebaseAuth, $googleProvider)
  }
  catch (e) {
    sessionStorage.removeItem(OAUTH_SESSION_KEY)
    error.value = debug.firebaseError(e)
    status.value = 'Something went wrong.'
    debug.log(`FAIL: signInWithRedirect ${debug.firebaseError(e)}`)
  }
})
</script>
