<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-center">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Sign in
    </p>
    <h1 class="text-2xl font-semibold mb-2">
      {{ done ? 'You\'re signed in' : 'Completing sign-in…' }}
    </h1>
    <p class="text-[var(--text-muted)] text-sm max-w-sm mb-4">
      {{ status }}
    </p>
    <p v-if="error" class="text-red-400 text-sm max-w-sm mb-4">{{ error }}</p>
    <NuxtLink v-if="error" to="/login" class="btn-primary mb-4">
      Back to login
    </NuxtLink>
    <a
      v-if="showOpenApp && !done && !error"
      :href="returnUrl"
      class="btn-primary mb-4"
    >
      Open LoopGallery app
    </a>
    <AuthDebugPanel />
  </div>
</template>

<script setup lang="ts">
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth'
import { isLikelyGoogleIdToken, readOAuthBridgeTokens } from '~/shared/auth-bridge'

definePageMeta({ layout: false })

const { $firebaseAuth } = useNuxtApp()
const { profile, refreshProfile, completeOnboarding } = useAuth()
const { navigateToHref, resolvePostLoginPath } = useProfileUrl()
const route = useRoute()
const debug = useAuthDebug('complete')

const status = ref('Securing your session…')
const error = ref('')
const done = ref(false)
const showOpenApp = ref(false)
let finishing = false

const returnUrl = ref('/auth/complete')

onMounted(() => {
  debug.clear()
  debug.log('complete mounted')
  if (import.meta.client) {
    const { isCapacitorNative } = useCapacitor()
    const href = window.location.href
    returnUrl.value = href
    showOpenApp.value = !isCapacitorNative() && (href.includes('gid=') || href.includes('gat='))
    debug.snapshotUrl()
    debug.snapshotClient()
    debug.snapshotFirebase()
    debug.log(`showOpenApp button: ${showOpenApp.value}`)
    const tokens = readOAuthBridgeTokens()
    debug.log(`bridge gid: ${tokens.googleIdToken ? `yes (${tokens.googleIdToken.length})` : 'no'}`)
    debug.log(`bridge gat: ${tokens.googleAccessToken ? 'yes' : 'no'}`)
  }
  void completeSignIn()
})

async function completeSignIn() {
  if (finishing) return
  finishing = true

  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    debug.log('FAIL: no $firebaseAuth')
    finishing = false
    return
  }

  const { googleIdToken, googleAccessToken } = import.meta.client
    ? readOAuthBridgeTokens()
    : { googleIdToken: null, googleAccessToken: null }

  if (!googleIdToken && !googleAccessToken) {
    if (showOpenApp.value) {
      status.value = 'Tap the button below to return to the app.'
      debug.log('no tokens but showOpenApp — waiting for user tap')
    }
    else {
      error.value = 'Missing sign-in token. Please try again from the app.'
      status.value = ''
      debug.log('FAIL: no gid/gat in URL')
    }
    finishing = false
    return
  }

  try {
    if (!$firebaseAuth.currentUser) {
      const idToken = googleIdToken?.trim() || null
      const accessToken = googleAccessToken?.trim() || null

      if (!isLikelyGoogleIdToken(idToken) && !accessToken) {
        error.value = 'Sign-in token was invalid or corrupted. Please try again from the app.'
        status.value = ''
        debug.log('FAIL: token shape invalid')
        finishing = false
        return
      }

      debug.log('signInWithCredential (WebView)…')
      const credential = isLikelyGoogleIdToken(idToken)
        ? GoogleAuthProvider.credential(idToken, accessToken || undefined)
        : GoogleAuthProvider.credential(null, accessToken)
      await signInWithCredential($firebaseAuth, credential)
      debug.log(`credential OK uid=${$firebaseAuth.currentUser?.uid ?? '?'}`)
    }
    else {
      debug.log(`already signed in uid=${$firebaseAuth.currentUser.uid}`)
    }

    await refreshProfile()
    debug.log(`profile username: ${profile.value?.username ?? '(none)'}`)
    if (profile.value?.needsOnboarding) {
      await completeOnboarding()
      debug.log('onboarding done')
    }

    done.value = true
    status.value = 'Redirecting…'

    if (import.meta.client) {
      history.replaceState(null, '', '/auth/complete')
      const { isCapacitorNative } = useCapacitor()
      debug.log(`capacitor native before close: ${isCapacitorNative()}`)
      if (isCapacitorNative()) {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close().catch((e) => {
          debug.log(`Browser.close: ${debug.firebaseError(e)}`)
        })
        debug.log('Browser.close called')
      }
    }

    const username = profile.value?.username
    if (username) {
      const next = typeof route.query.next === 'string' ? route.query.next : undefined
      const path = resolvePostLoginPath(next, username)
      debug.log(`navigate → ${path}`)
      await navigateToHref(path)
      return
    }

    debug.log('navigate → /dashboard')
    await navigateTo('/dashboard')
  }
  catch (e) {
    const msg = debug.firebaseError(e)
    error.value = msg.includes('auth/')
      ? `Sign-in failed (${msg}). Close the app and try again.`
      : msg
    status.value = ''
    debug.log(`FAIL: ${msg}`)
    finishing = false
  }
}
</script>
