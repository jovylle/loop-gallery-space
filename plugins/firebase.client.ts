import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

let app: FirebaseApp
let auth: Auth

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()

  if (!config.public.firebaseApiKey) {
    console.warn('[LoopGallery] Firebase not configured. Set NUXT_PUBLIC_FIREBASE_* env vars.')
    return {
      provide: {
        firebaseAuth: null as Auth | null,
        googleProvider: null as GoogleAuthProvider | null,
      },
    }
  }

  if (!getApps().length) {
    app = initializeApp({
      apiKey: config.public.firebaseApiKey,
      authDomain: config.public.firebaseAuthDomain,
      projectId: config.public.firebaseProjectId,
      appId: config.public.firebaseAppId,
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
