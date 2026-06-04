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
import { isOAuthReturnFromGoogle } from '~/shared/auth-bridge'
import { firebaseHostingOrigin } from '~/shared/firebase.config'

definePageMeta({ layout: false })

const OAUTH_SESSION_KEY = 'lg-oauth-session'
const FIREBASE_HOP_KEY = 'lg-oauth-firebase-hop'

const { $firebaseAuth } = useNuxtApp()
const { status, error, completePendingRedirect, debug } = useOAuthRedirectFinish('handler')

onMounted(async () => {
  debug.clear()
  debug.log('handler mounted')
  debug.snapshotUrl()
  debug.snapshotOAuthQuery()
  debug.snapshotClient()
  debug.snapshotFirebase()
  debug.log(`isOAuthReturnFromGoogle: ${isOAuthReturnFromGoogle()}`)
  debug.log(`session ${FIREBASE_HOP_KEY}: ${sessionStorage.getItem(FIREBASE_HOP_KEY) ?? '(unset)'}`)

  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    debug.log('FAIL: no $firebaseAuth')
    return
  }

  const authType = new URLSearchParams(window.location.search).get('authType')
  debug.log(`authType: ${authType ?? '(none)'}`)

  // Popup OAuth must run Firebase's hosted handler (postMessage to opener). Our Nuxt page only
  // finishes redirect flows for Custom Tab /auth/mobile — same hop as pre-Google redirect.
  if (authType === 'signInViaPopup') {
    const target = `${firebaseHostingOrigin}/__/auth/handler${window.location.search}${window.location.hash}`
    status.value = 'Completing sign-in…'
    debug.log(`popup hop → ${debug.redactUrl(target)}`)
    window.location.replace(target)
    return
  }

  try {
    status.value = 'Finishing sign-in…'
    const done = await completePendingRedirect($firebaseAuth)
    if (done) {
      sessionStorage.removeItem(OAUTH_SESSION_KEY)
      sessionStorage.removeItem(FIREBASE_HOP_KEY)
      debug.log('SUCCESS: redirecting to /auth/complete')
      return
    }

    // Pre-Google hop: Firebase lands here before accounts.google.com. Our page must not
    // stop the chain — forward once to Firebase’s hosted handler (it redirects to Google).
    if (authType === 'signInViaRedirect' && !isOAuthReturnFromGoogle()) {
      if (sessionStorage.getItem(FIREBASE_HOP_KEY) !== '1') {
        sessionStorage.setItem(FIREBASE_HOP_KEY, '1')
        const target = `${firebaseHostingOrigin}/__/auth/handler${window.location.search}${window.location.hash}`
        status.value = 'Continuing to Google…'
        debug.log(`pre-Google hop → ${debug.redactUrl(target)}`)
        window.location.replace(target)
        return
      }
      debug.log('pre-Google hop: already forwarded to firebaseapp.com')
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
