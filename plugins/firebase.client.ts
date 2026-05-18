import { initializeApp, getApps, type FirebaseApp } from 'firebase/app'
import {
  getAuth,
  GoogleAuthProvider,
  initializeAuth,
  indexedDBLocalPersistence,
  type Auth,
} from 'firebase/auth'
import { firebaseWebConfig } from '~/shared/firebase.config'

let app: FirebaseApp | null = null

async function createAuth(firebaseApp: FirebaseApp): Promise<Auth> {
  if (import.meta.client) {
    const { Capacitor } = await import('@capacitor/core')
    if (Capacitor.isNativePlatform()) {
      try {
        return initializeAuth(firebaseApp, { persistence: indexedDBLocalPersistence })
      }
      catch {
        return getAuth(firebaseApp)
      }
    }
  }
  return getAuth(firebaseApp)
}

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  const authDomain = String(config.public.firebaseAuthDomain || firebaseWebConfig.authDomain)

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
      authDomain,
      projectId: firebaseWebConfig.projectId,
      appId: firebaseWebConfig.appId,
    })
  }
  else {
    app = getApps()[0]!
  }

  const auth = await createAuth(app)
  const googleProvider = new GoogleAuthProvider()

  return {
    provide: {
      firebaseAuth: auth,
      googleProvider,
    },
  }
})
