/**
 * Firebase web SDK config (public). Security is enforced via Firebase
 * Authorized Domains + Google OAuth — not by hiding these values.
 *
 * @see https://firebase.google.com/docs/projects/api-keys
 */
export const firebaseWebConfig = {
  apiKey: 'AIzaSyAAGcGQbbiC-qXtbGEc5hF32m6rCHar1DM',
  /** Must match the site host so redirect OAuth can complete on /__/auth/handler. */
  authDomain: 'loopgallery.a-u.us',
  projectId: 'loopgallery-9a4d7',
  appId: '1:964202837822:web:1053c48e43196d6b151e6f',
} as const

export const firebaseProjectId = firebaseWebConfig.projectId

/** Default Firebase Hosting origin (proxy /__/auth/* here when not using Firebase Hosting). */
export const firebaseHostingOrigin = `https://${firebaseWebConfig.projectId}.firebaseapp.com`
