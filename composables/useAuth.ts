import {
  getRedirectResult,
  onAuthStateChanged,
  signInWithRedirect,
  signOut,
  type User,
} from 'firebase/auth'
import {
  OAUTH_WEB_NEXT_KEY,
  OAUTH_WEB_SESSION_KEY,
} from '~/shared/auth-bridge'
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

  async function signInWithGoogleBrowser() {
    const config = useRuntimeConfig()
    let site = String(config.public.siteUrl || 'https://loopgallery.a-u.us').replace(/\/$/, '')
    // Emulator WebView uses 10.0.2.2 — Custom Tab must use the same origin, not localhost.
    if (import.meta.client) {
      const { isCapacitorNative } = useCapacitor()
      if (isCapacitorNative()) {
        site = window.location.origin
      }
    }
    const { Browser } = await import('@capacitor/browser')
    await Browser.open({ url: `${site}/auth/mobile` })
  }

  function markWebOAuthIntent(next?: string) {
    if (!import.meta.client) return
    sessionStorage.setItem(OAUTH_WEB_SESSION_KEY, '1')
    if (next) sessionStorage.setItem(OAUTH_WEB_NEXT_KEY, next)
    else sessionStorage.removeItem(OAUTH_WEB_NEXT_KEY)
  }

  /** Finish browser redirect sign-in after Google returns to /login. */
  async function finishWebRedirectSignIn(): Promise<string | null> {
    if (!$firebaseAuth || !import.meta.client) return null
    if (sessionStorage.getItem(OAUTH_WEB_SESSION_KEY) !== '1') return null

    const result = await getRedirectResult($firebaseAuth)
    if (!result?.user) return null

    sessionStorage.removeItem(OAUTH_WEB_SESSION_KEY)
    const next = sessionStorage.getItem(OAUTH_WEB_NEXT_KEY)
    sessionStorage.removeItem(OAUTH_WEB_NEXT_KEY)

    await refreshProfile()
    if (profile.value?.needsOnboarding) {
      await completeOnboarding()
    }

    const username = profile.value?.username
    if (!username) return '/dashboard'

    const { resolvePostLoginPath } = useProfileUrl()
    return resolvePostLoginPath(next ?? undefined, username)
  }

  async function signInWithGoogle(next?: string) {
    if (!$firebaseAuth || !$googleProvider) {
      throw new Error('Firebase not configured')
    }
    const { isCapacitorNative } = useCapacitor()
    // Always use Chrome Custom Tabs on Android — WebView OAuth gets disallowed_useragent.
    // Native Firebase auth only when google-services.json is configured (see signInWithGoogleNative).
    if (isCapacitorNative()) {
      await signInWithGoogleBrowser()
      return
    }
    // Redirect OAuth needs /__/auth/* proxied to firebaseapp.com on our custom domain.
    markWebOAuthIntent(next)
    await signInWithRedirect($firebaseAuth, $googleProvider)
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
        window.location.assign(url)
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
    signInWithGoogleBrowser,
    markWebOAuthIntent,
    finishWebRedirectSignIn,
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
