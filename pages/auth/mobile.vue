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
import {
  getRedirectResult,
  GoogleAuthProvider,
  signInWithRedirect,
  signOut,
  type UserCredential,
} from 'firebase/auth'
import { buildOAuthBridgeQuery, isLikelyGoogleIdToken } from '~/shared/auth-bridge'

definePageMeta({ layout: false })

const { $firebaseAuth, $googleProvider } = useNuxtApp()
const status = ref('Opening Google sign-in…')
const error = ref('')

onMounted(async () => {
  if (!$firebaseAuth || !$googleProvider) {
    error.value = 'Firebase is not configured.'
    return
  }

  try {
    const existing = await getRedirectResult($firebaseAuth)
    if (existing?.user) {
      await finishWithOAuthCredential(existing)
      return
    }

    status.value = 'Redirecting to Google…'
    await signInWithRedirect($firebaseAuth, $googleProvider)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
    status.value = 'Something went wrong.'
  }
})

async function finishWithOAuthCredential(result: UserCredential) {
  status.value = 'Finishing sign-in…'
  const oauth = GoogleAuthProvider.credentialFromResult(result)
  if (!oauth?.idToken && !oauth?.accessToken) {
    error.value = 'Could not read Google credentials. Please try again.'
    status.value = ''
    return
  }

  if (!isLikelyGoogleIdToken(oauth.idToken)) {
    error.value = 'Google sign-in token was invalid. Please try again.'
    status.value = ''
    return
  }

  const query = buildOAuthBridgeQuery({
    googleIdToken: oauth.idToken,
    googleAccessToken: oauth.accessToken,
  })
  if (!query) {
    error.value = 'Could not package sign-in credentials.'
    status.value = ''
    return
  }

  // Sign out in the Custom Tab so /auth/complete can sign into the app WebView cleanly.
  await signOut($firebaseAuth).catch(() => {})
  window.location.replace(`/auth/complete${query}`)
}
</script>
