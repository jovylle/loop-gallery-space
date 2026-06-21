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
      {{ signingInLabel }}
    </button>
    <p v-else class="text-amber-400 text-sm">
      Firebase is not configured. Check <code class="font-mono">shared/firebase.config.ts</code>.
    </p>

    <p v-if="error" class="mt-4 text-red-400 text-sm">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'default' })

const { signInWithGoogle, user, profile, loading, isConfigured, finishWebRedirectSignIn } = useAuth()
const route = useRoute()
const { navigateToHref, resolvePostLoginPath } = useProfileUrl()
const signingIn = ref(false)
const error = ref('')
const { isCapacitorNative } = useCapacitor()

onMounted(async () => {
  if (isCapacitorNative()) return
  try {
    const path = await finishWebRedirectSignIn()
    if (path) await navigateToHref(path)
  }
  catch (e) {
    error.value = e instanceof Error ? e.message : 'Sign in failed'
  }
})

const signingInLabel = computed(() => {
  if (!signingIn.value) return 'Continue with Google'
  if (isCapacitorNative()) return 'Signing in…'
  return 'Setting up your space…'
})

function goAfterLogin() {
  const username = profile.value?.username
  if (!username) return
  const next = typeof route.query.next === 'string' ? route.query.next : undefined
  return navigateToHref(resolvePostLoginPath(next, username))
}

watch(
  [user, profile, loading],
  () => {
    if (loading.value || !user.value || !profile.value?.username) return
    if (profile.value.needsOnboarding) return
    goAfterLogin()
  },
  { immediate: true },
)

async function handleSignIn() {
  error.value = ''
  signingIn.value = true
  try {
    const next = typeof route.query.next === 'string' ? route.query.next : undefined
    await signInWithGoogle(next)
  }
  catch (e) {
    const msg = e instanceof Error ? e.message : 'Sign in failed'
    error.value = msg.includes('auth/popup-closed-by-user')
      ? 'Sign-in was interrupted. Please try again.'
      : msg
  }
  finally {
    signingIn.value = false
  }
}
</script>
