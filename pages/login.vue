<template>
  <div class="max-w-md mx-auto py-16 text-center">
    <h1 class="text-3xl font-semibold mb-3">Welcome</h1>
    <p class="text-[var(--text-muted)] mb-8">
      Sign in with Google to create your gallery space.
    </p>

    <button
      v-if="isConfigured"
      type="button"
      class="btn-primary w-full"
      :disabled="loading || signingIn"
      @click="handleSignIn"
    >
      {{ signingIn ? 'Setting up your space…' : 'Continue with Google' }}
    </button>
    <p v-else class="text-amber-400 text-sm">
      Firebase is not configured. Add secrets on the
      <strong>loop-gallery-space</strong> Worker (Settings → Variables) — see
      <code class="font-mono">.env.example</code> for names — then redeploy.
    </p>

    <p v-if="error" class="mt-4 text-red-400 text-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { signInWithGoogle, user, profile, loading, isConfigured } = useAuth()
const signingIn = ref(false)
const error = ref('')

watch(
  [user, profile, loading],
  () => {
    if (loading.value || !user.value || !profile.value?.username) return
    if (profile.value.needsOnboarding) return
    navigateTo(`/${profile.value.username}`)
  },
  { immediate: true },
)

async function handleSignIn() {
  error.value = ''
  signingIn.value = true
  try {
    await signInWithGoogle()
    if (profile.value?.username) {
      await navigateTo(`/${profile.value.username}`)
    }
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
  }
  finally {
    signingIn.value = false
  }
}
</script>
