/**
 * Firebase web SDK config (public). Security is enforced via Firebase
 * Authorized Domains + Google OAuth — not by hiding these values.
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
