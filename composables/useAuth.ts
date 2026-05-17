import {
  onAuthStateChanged,
  onIdTokenChanged,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth'
import type { AuthUser } from '~/shared/types'

export function useAuth() {
  const { $firebaseAuth, $googleProvider } = useNuxtApp()
  const config = useRuntimeConfig()
  const user = useState<User | null>('firebase-user', () => null)
  const profile = useState<AuthUser | null>('auth-profile', () => null)
  const loading = useState('auth-loading', () => true)

  const crossHostAuth = computed(() => Boolean(config.public.galleryHost))

  const isAuthenticated = computed(() => !!user.value || !!profile.value)

  function authFetchOptions(): { credentials?: RequestCredentials } {
    return crossHostAuth.value ? { credentials: 'include' as const } : {}
  }

  async function getIdToken(): Promise<string | null> {
    if (!user.value) return null
    return user.value.getIdToken()
  }

  async function syncSessionCookie(): Promise<void> {
    if (!crossHostAuth.value || !import.meta.client) return
    const token = await getIdToken()
    if (!token) return
    try {
      await $fetch('/api/auth/session', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        ...authFetchOptions(),
      })
    }
    catch {
      // Non-fatal; Bearer auth still works on the current host.
    }
  }

  async function clearSessionCookie(): Promise<void> {
    if (!crossHostAuth.value || !import.meta.client) return
    try {
      await $fetch('/api/auth/session', {
        method: 'DELETE',
        ...authFetchOptions(),
      })
    }
    catch {
      // ignore
    }
  }

  async function apiFetch<T>(url: string, options: Parameters<typeof $fetch<T>>[1] = {}) {
    const token = await getIdToken()
    if (token && crossHostAuth.value) {
      void syncSessionCookie()
    }
    return $fetch<T>(url, {
      ...options,
      ...authFetchOptions(),
      headers: {
        ...((options.headers as Record<string, string>) || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })
  }

  async function refreshProfile() {
    if (!user.value && !crossHostAuth.value) {
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

  async function tryRestoreFromSessionCookie(): Promise<boolean> {
    if (!crossHostAuth.value || !import.meta.client) return false
    try {
      profile.value = await $fetch<AuthUser>('/api/auth/me', authFetchOptions())
      return !!profile.value
    }
    catch {
      profile.value = null
      return false
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
    await signInWithPopup($firebaseAuth, $googleProvider)
    await syncSessionCookie()
    await refreshProfile()
    if (profile.value?.needsOnboarding) {
      await completeOnboarding()
    }
  }

  async function logout() {
    if ($firebaseAuth) await signOut($firebaseAuth)
    await clearSessionCookie()
    user.value = null
    profile.value = null
    await navigateTo('/')
  }

  function initAuthListener() {
    if (!$firebaseAuth) {
      if (crossHostAuth.value) {
        void tryRestoreFromSessionCookie().finally(() => {
          loading.value = false
        })
      }
      else {
        loading.value = false
      }
      return
    }

    let idTokenUnsubscribe: (() => void) | null = null

    onAuthStateChanged($firebaseAuth, async (u) => {
      user.value = u
      if (u) {
        await syncSessionCookie()
        await refreshProfile()
        if (profile.value?.needsOnboarding) {
          await completeOnboarding()
        }
        if (!idTokenUnsubscribe) {
          idTokenUnsubscribe = onIdTokenChanged($firebaseAuth, () => {
            void syncSessionCookie()
          })
        }
      }
      else {
        const restored = await tryRestoreFromSessionCookie()
        if (!restored) {
          profile.value = null
        }
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
