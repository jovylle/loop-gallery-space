import {
  getRedirectResult,
  GoogleAuthProvider,
  signOut,
  type Auth,
  type UserCredential,
} from 'firebase/auth'
import { buildOAuthBridgeQuery, isLikelyGoogleIdToken } from '~/shared/auth-bridge'

/** Finish Custom Tab / redirect OAuth and hand tokens to /auth/complete for the native app. */
export function useOAuthRedirectFinish(screen = 'oauth') {
  const status = ref('Finishing sign-in…')
  const error = ref('')
  const debug = useAuthDebug(screen)

  async function finishWithOAuthCredential(result: UserCredential) {
    status.value = 'Finishing sign-in…'
    debug.log(`credential user: ${result.user?.uid ?? '?'}`)
    const oauth = GoogleAuthProvider.credentialFromResult(result)
    debug.log(`oauth idToken: ${oauth?.idToken ? `yes (${oauth.idToken.length})` : 'no'}`)
    debug.log(`oauth accessToken: ${oauth?.accessToken ? 'yes' : 'no'}`)

    if (!oauth?.idToken && !oauth?.accessToken) {
      error.value = 'Could not read Google credentials. Please try again.'
      status.value = ''
      debug.log('FAIL: no oauth tokens on credential')
      return false
    }

    if (!isLikelyGoogleIdToken(oauth.idToken)) {
      error.value = 'Google sign-in token was invalid. Please try again.'
      status.value = ''
      debug.log('FAIL: idToken failed shape check')
      return false
    }

    const query = buildOAuthBridgeQuery({
      googleIdToken: oauth.idToken,
      googleAccessToken: oauth.accessToken,
    })
    if (!query) {
      error.value = 'Could not package sign-in credentials.'
      status.value = ''
      debug.log('FAIL: buildOAuthBridgeQuery empty')
      return false
    }

    const { $firebaseAuth } = useNuxtApp()
    if ($firebaseAuth) {
      await signOut($firebaseAuth).catch((e) => {
        debug.log(`signOut (tab) ignored: ${debug.firebaseError(e)}`)
      })
    }
    const target = `/auth/complete${query}`
    debug.log(`redirect → ${debug.redactUrl(`${window.location.origin}${target}`)}`)
    sessionStorage.removeItem('lg-oauth-session')
    sessionStorage.removeItem('lg-oauth-firebase-hop')
    window.location.replace(target)
    return true
  }

  async function completePendingRedirect(auth: Auth) {
    debug.log('getRedirectResult: start')
    try {
      const existing = await getRedirectResult(auth)
      if (!existing?.user) {
        debug.log('getRedirectResult: no user (null result)')
        return false
      }
      debug.log(`getRedirectResult: OK uid=${existing.user.uid}`)
      return finishWithOAuthCredential(existing)
    }
    catch (e) {
      debug.log(`getRedirectResult: ERROR ${debug.firebaseError(e)}`)
      throw e
    }
  }

  return { status, error, finishWithOAuthCredential, completePendingRedirect, debug }
}
