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
import { getRedirectResult, signInWithRedirect } from 'firebase/auth'
import type { User } from 'firebase/auth'

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
      await finishWithToken(existing.user)
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

async function finishWithToken(user: User) {
  status.value = 'Finishing sign-in…'
  const idToken = await user.getIdToken()
  const target = `/auth/complete#idToken=${encodeURIComponent(idToken)}`
  window.location.replace(target)
}
</script>
