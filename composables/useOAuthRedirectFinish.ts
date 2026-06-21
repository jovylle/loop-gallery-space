import {
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  type Auth,
  type UserCredential,
} from 'firebase/auth'
import { buildOAuthBridgeQuery, isLikelyGoogleIdToken, OAUTH_MOBILE_SESSION_KEY } from '~/shared/auth-bridge'

function formatFirebaseError(e: unknown): string {
  if (e && typeof e === 'object') {
    const o = e as { code?: string, message?: string }
    return [o.code, o.message].filter(Boolean).join(' — ') || String(e)
  }
  return e instanceof Error ? e.message : String(e)
}

/** Finish Custom Tab / redirect OAuth and hand tokens to /auth/complete for the native app. */
export function useOAuthRedirectFinish() {
  const status = ref('Finishing sign-in…')
  const error = ref('')

  async function finishWithOAuthCredential(result: UserCredential) {
    status.value = 'Finishing sign-in…'
    const oauth = GoogleAuthProvider.credentialFromResult(result)

    if (!oauth?.idToken && !oauth?.accessToken) {
      error.value = 'Could not read Google credentials. Please try again.'
      status.value = ''
      return false
    }

    if (!isLikelyGoogleIdToken(oauth.idToken)) {
      error.value = 'Google sign-in token was invalid. Please try again.'
      status.value = ''
      return false
    }

    const query = buildOAuthBridgeQuery({
      googleIdToken: oauth.idToken,
      googleAccessToken: oauth.accessToken,
    })
    if (!query) {
      error.value = 'Could not package sign-in credentials.'
      status.value = ''
      return false
    }

    const { $firebaseAuth } = useNuxtApp()
    if ($firebaseAuth) {
      await signOut($firebaseAuth).catch(() => {})
    }
    const target = `/auth/complete${query}`
    sessionStorage.removeItem(OAUTH_MOBILE_SESSION_KEY)
    sessionStorage.removeItem('lg-oauth-firebase-hop')
    window.location.replace(target)
    return true
  }

  async function completePendingRedirect(auth: Auth) {
    const existing = await getRedirectResult(auth)
    if (!existing?.user) return false
    return finishWithOAuthCredential(existing)
  }

  return { status, error, finishWithOAuthCredential, completePendingRedirect, formatFirebaseError }
}
