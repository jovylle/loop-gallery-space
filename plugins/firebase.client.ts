import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

let app: FirebaseApp | null = null
let auth: Auth | null = null

export default defineNuxtPlugin(async () => {
  let firebaseConfig: {
    apiKey: string
    authDomain: string
    projectId: string
    appId: string
  }

  try {
    firebaseConfig = await $fetch('/api/config/firebase')
  }
  catch (e) {
    console.warn('[LoopGallery] Could not load Firebase config:', e)
    return {
      provide: {
        firebaseAuth: null as Auth | null,
        googleProvider: null as GoogleAuthProvider | null,
      },
    }
  }

  if (!firebaseConfig.apiKey) {
    console.warn('[LoopGallery] Firebase API key missing on server.')
    return {
      provide: {
        firebaseAuth: null as Auth | null,
        googleProvider: null as GoogleAuthProvider | null,
      },
    }
  }

  if (!getApps().length) {
    app = initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      appId: firebaseConfig.appId,
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
