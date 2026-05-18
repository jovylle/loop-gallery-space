<template>
  <div class="min-h-screen flex flex-col items-center justify-center px-6 text-center">
    <p class="font-mono text-sm text-accent mb-3 tracking-wider uppercase">
      Sign in
    </p>
    <h1 class="text-2xl font-semibold mb-2">
      {{ done ? 'You\'re signed in' : 'Completing sign-in…' }}
    </h1>
    <p class="text-[var(--text-muted)] text-sm max-w-sm mb-6">
      {{ status }}
    </p>
    <p v-if="error" class="text-red-400 text-sm max-w-sm mb-4">{{ error }}</p>
    <NuxtLink v-if="error" to="/login" class="btn-primary">
      Back to login
    </NuxtLink>
    <a
      v-if="showOpenApp && !done && !error"
      :href="returnUrl"
      class="btn-primary"
    >
      Open LoopGallery app
    </a>
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

const status = ref('Securing your session…')
const error = ref('')
const done = ref(false)
const showOpenApp = ref(false)
let finishing = false

/** Captured before replaceState strips OAuth query params from the address bar. */
const returnUrl = ref('/auth/complete')

onMounted(() => {
  if (import.meta.client) {
    const { isCapacitorNative } = useCapacitor()
    const href = window.location.href
    returnUrl.value = href
    showOpenApp.value = !isCapacitorNative() && (href.includes('gid=') || href.includes('gat='))
  }
  void completeSignIn()
})

async function completeSignIn() {
  if (finishing) return
  finishing = true

  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    finishing = false
    return
  }

  const { googleIdToken, googleAccessToken } = import.meta.client
    ? readOAuthBridgeTokens()
    : { googleIdToken: null, googleAccessToken: null }

  if (!googleIdToken && !googleAccessToken) {
    if (showOpenApp.value) {
      status.value = 'Tap the button below to return to the app.'
    }
    else {
      error.value = 'Missing sign-in token. Please try again from the app.'
      status.value = ''
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
        finishing = false
        return
      }

      const credential = isLikelyGoogleIdToken(idToken)
        ? GoogleAuthProvider.credential(idToken, accessToken || undefined)
        : GoogleAuthProvider.credential(null, accessToken)
      await signInWithCredential($firebaseAuth, credential)
    }
    await refreshProfile()
    if (profile.value?.needsOnboarding) {
      await completeOnboarding()
    }

    done.value = true
    status.value = 'Redirecting…'

    if (import.meta.client) {
      history.replaceState(null, '', '/auth/complete')
      const { isCapacitorNative } = useCapacitor()
      if (isCapacitorNative()) {
        const { Browser } = await import('@capacitor/browser')
        await Browser.close().catch(() => {})
      }
    }

    const username = profile.value?.username
    if (username) {
      const next = typeof route.query.next === 'string' ? route.query.next : undefined
      await navigateToHref(resolvePostLoginPath(next, username))
      return
    }

    await navigateTo('/dashboard')
  }
  catch (e) {
    const code = e && typeof e === 'object' && 'code' in e ? String((e as { code: string }).code) : ''
    error.value = code
      ? `Sign-in failed (${code}). Close the app and try again.`
      : (e instanceof Error ? e.message : 'Could not complete sign-in')
    status.value = ''
    finishing = false
  }
}
</script>
