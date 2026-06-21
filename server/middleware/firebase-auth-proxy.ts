import { firebaseHostingOrigin } from '../../shared/firebase.config'

/** Transparent proxy for Firebase sign-in helpers (iframe, handler, init.json). */
export default defineEventHandler((event) => {
  const path = event.path.split('?')[0] ?? ''
  if (!path.startsWith('/__/auth/') && !path.startsWith('/__/firebase/')) {
    return
  }
  return proxyRequest(event, `${firebaseHostingOrigin}${event.path}`)
})
