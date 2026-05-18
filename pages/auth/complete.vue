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

definePageMeta({ layout: false })

const { $firebaseAuth } = useNuxtApp()
const { profile, refreshProfile, completeOnboarding } = useAuth()
const { navigateToHref, resolvePostLoginPath } = useProfileUrl()
const route = useRoute()

const status = ref('Securing your session…')
const error = ref('')
const done = ref(false)
const showOpenApp = ref(false)

const returnUrl = computed(() => {
  if (!import.meta.client) return '/auth/complete'
  return window.location.href
})

onMounted(() => {
  if (import.meta.client) {
    const { isCapacitorNative } = useCapacitor()
    const hash = window.location.hash
    showOpenApp.value = !isCapacitorNative() && (hash.includes('gid=') || hash.includes('gat='))
  }
  void completeSignIn()
})

async function completeSignIn() {
  if (!$firebaseAuth) {
    error.value = 'Firebase is not configured.'
    return
  }

  const hash = import.meta.client ? window.location.hash.slice(1) : ''
  const params = new URLSearchParams(hash)
  const googleIdToken = params.get('gid')
  const googleAccessToken = params.get('gat')

  if (!googleIdToken && !googleAccessToken) {
    if (showOpenApp.value) {
      status.value = 'Tap the button below to return to the app.'
      return
    }
    error.value = 'Missing sign-in token. Please try again from the app.'
    status.value = ''
    return
  }

  try {
    const credential = GoogleAuthProvider.credential(googleIdToken, googleAccessToken)
    await signInWithCredential($firebaseAuth, credential)
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
    error.value = e instanceof Error ? e.message : 'Could not complete sign-in'
    status.value = ''
  }
}
</script>
