/**
 * Firebase web SDK config (public). Security is enforced via Firebase
 * Authorized Domains + Google OAuth — not by hiding these values.
 *
 * Production subdomain galleries: set NUXT_PUBLIC_GALLERY_HOST (or
 * NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN) so authDomain matches the apex host.
 * Complete Firebase Authentication → Settings → Authorized domains and
 * add a custom auth domain for that host.
 *
 * @see https://firebase.google.com/docs/projects/api-keys
 */
export const firebaseWebConfig = {
  apiKey: 'AIzaSyAAGcGQbbiC-qXtbGEc5hF32m6rCHar1DM',
  authDomain: 'loopgallery-9a4d7.firebaseapp.com',
  projectId: 'loopgallery-9a4d7',
  appId: '1:964202837822:web:1053c48e43196d6b151e6f',
} as const

export const firebaseProjectId = firebaseWebConfig.projectId
