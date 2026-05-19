import {
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  type Auth,
  type UserCredential,
} from 'firebase/auth'
import { buildOAuthBridgeQuery, isLikelyGoogleIdToken } from '~/shared/auth-bridge'

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
    window.location.replace(`/auth/complete${query}`)
    return true
  }

  async function completePendingRedirect(auth: Auth) {
    const existing = await getRedirectResult(auth)
    if (!existing?.user) return false
    return finishWithOAuthCredential(existing)
  }

  return { status, error, finishWithOAuthCredential, completePendingRedirect }
}
