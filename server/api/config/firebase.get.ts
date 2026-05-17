/** Public Firebase web config — read at runtime from Cloudflare Worker secrets. */
export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)

  const apiKey =
    getWorkerEnv(event, 'NUXT_PUBLIC_FIREBASE_API_KEY') || config.public.firebaseApiKey || ''
  const authDomain =
    getWorkerEnv(event, 'NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN') || config.public.firebaseAuthDomain || ''
  const projectId =
    getWorkerEnv(event, 'NUXT_PUBLIC_FIREBASE_PROJECT_ID') || config.public.firebaseProjectId || ''
  const appId =
    getWorkerEnv(event, 'NUXT_PUBLIC_FIREBASE_APP_ID') || config.public.firebaseAppId || ''

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Firebase is not configured on the server',
    })
  }

  return { apiKey, authDomain, projectId, appId }
})
