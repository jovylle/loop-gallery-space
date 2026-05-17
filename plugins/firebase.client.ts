import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'
import { firebaseWebConfig } from '~/shared/firebase.config'

let app: FirebaseApp | null = null
let auth: Auth | null = null

export default defineNuxtPlugin(() => {
  if (!firebaseWebConfig.apiKey) {
    console.warn('[LoopGallery] Firebase API key missing in shared/firebase.config.ts')
    return {
      provide: {
        firebaseAuth: null as Auth | null,
        googleProvider: null as GoogleAuthProvider | null,
      },
    }
  }

  if (!getApps().length) {
    app = initializeApp({
      apiKey: firebaseWebConfig.apiKey,
      authDomain: firebaseWebConfig.authDomain,
      projectId: firebaseWebConfig.projectId,
      appId: firebaseWebConfig.appId,
    })
  }
  else {
    app = getApps()[0]!
  }

  auth = getAuth(app)
  const googleProvider = new GoogleAuthProvider()

  return {
    provide: {
      firebaseAuth: auth,
      googleProvider,
    },
  }
})
