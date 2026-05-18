import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import type { AuthUser } from '~/shared/types'

export function useAuth() {
  const { $firebaseAuth, $googleProvider } = useNuxtApp()
  const user = useState<User | null>('firebase-user', () => null)
  const profile = useState<AuthUser | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => true)

  const isAuthenticated = computed(() => !!user.value || !!profile.value)

  async function getIdToken(): Promise<string | null> {
    if (!user.value) return null
    return user.value.getIdToken()
  }

  async function apiFetch<T>(url: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
    const token = await getIdToken()
    return $fetch<T>(url, {
      ...options,
      headers: {
        ...((options.headers as Record<string, string>) || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  async function refreshProfile() {
    if (!user.value) {
      profile.value = null
      return
    }
    try {
      profile.value = await apiFetch<AuthUser>('/api/auth/me')
    }
    catch {
      profile.value = null
    }
  }

  async function completeOnboarding() {
    const displayName = user.value?.displayName || undefined
    profile.value = await apiFetch<AuthUser>('/api/onboarding/setup', {
      method: 'POST',
      body: { displayName },
    })
    return profile.value
  }

  async function signInWithGoogle() {
    if (!$firebaseAuth || !$googleProvider) {
      throw new Error('Firebase not configured')
    }
    const { isCapacitorNative } = useCapacitor()
    if (isCapacitorNative()) {
      await signInWithRedirect($firebaseAuth, $googleProvider)
      return
    }
    await signInWithPopup($firebaseAuth, $googleProvider)
    await refreshProfile()
    if (profile.value?.needsOnboarding) {
      await completeOnboarding()
    }
  }

  async function logout() {
    if ($firebaseAuth) await signOut($firebaseAuth)
    user.value = null
    profile.value = null
    await navigateTo('/')
  }

  async function finishRedirectSignIn() {
    if (!$firebaseAuth) return
    const result = await getRedirectResult($firebaseAuth)
    if (!result?.user) return
    await refreshProfile()
    if (profile.value?.needsOnboarding) {
      await completeOnboarding()
    }
  }

  function initAuthListener() {
    if (!$firebaseAuth) {
      loading.value = false
      return
    }

    void finishRedirectSignIn()

    onAuthStateChanged($firebaseAuth, async (u) => {
      user.value = u
      if (u) {
        await refreshProfile()
        if (profile.value?.needsOnboarding) {
          await completeOnboarding()
        }
      }
      else {
        profile.value = null
      }
      loading.value = false
    })
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    signInWithGoogle,
    completeOnboarding,
    logout,
    refreshProfile,
    getIdToken,
    apiFetch,
    initAuthListener,
    isConfigured: computed(() => !!$firebaseAuth),
  }
}
