import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import { isSameGalleryAppUrl } from '~/shared/host'
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

  async function signInWithGoogleNative() {
    if (!$firebaseAuth) throw new Error('Firebase not configured')
    const { FirebaseAuthentication } = await import('@capacitor-firebase/authentication')
    const { GoogleAuthProvider, signInWithCredential } = await import('firebase/auth')
    const result = await FirebaseAuthentication.signInWithGoogle()
    const idToken = result.credential?.idToken
    if (!idToken) throw new Error('Google sign in was cancelled')
    await signInWithCredential($firebaseAuth, GoogleAuthProvider.credential(idToken))
    await refreshProfile()
    if (profile.value?.needsOnboarding) {
      await completeOnboarding()
    }
  }

  async function signInWithGoogle() {
    if (!$firebaseAuth || !$googleProvider) {
      throw new Error('Firebase not configured')
    }
    const { isCapacitorNative } = useCapacitor()
    if (isCapacitorNative()) {
      try {
        await signInWithGoogleNative()
        return
      }
      catch (e) {
        console.warn('[LoopGallery] Native Google sign-in failed, trying redirect:', e)
        await signInWithRedirect($firebaseAuth, $googleProvider)
        return
      }
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

  function initNativeAuthBridge() {
    if (!import.meta.client) return
    const { isCapacitorNative } = useCapacitor()
    if (!isCapacitorNative()) return

    const config = useRuntimeConfig()
    const galleryHost = String(config.public.galleryHost || '')

    void import('@capacitor/app').then(({ App }) => {
      App.addListener('appUrlOpen', ({ url }) => {
        if (!isSameGalleryAppUrl(url, galleryHost)) return
        const normalized = url.replace(/\/$/, '')
        const here = window.location.href.replace(/\/$/, '')
        if (normalized !== here) window.location.assign(url)
      })
      App.addListener('resume', () => {
        void finishRedirectSignIn()
      })
    })
  }

  function initAuthListener() {
    if (!$firebaseAuth) {
      loading.value = false
      return
    }

    initNativeAuthBridge()
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
    signInWithGoogleNative,
    completeOnboarding,
    logout,
    refreshProfile,
    finishRedirectSignIn,
    getIdToken,
    apiFetch,
    initAuthListener,
    isConfigured: computed(() => !!$firebaseAuth),
  }
}
