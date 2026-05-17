/** Public Firebase web config — read at runtime from Cloudflare env (not build-time bundle). */
export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  const apiKey =
    process.env.NUXT_PUBLIC_FIREBASE_API_KEY || config.public.firebaseApiKey || ''
  const authDomain =
    process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || config.public.firebaseAuthDomain || ''
  const projectId =
    process.env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || config.public.firebaseProjectId || ''
  const appId =
    process.env.NUXT_PUBLIC_FIREBASE_APP_ID || config.public.firebaseAppId || ''

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Firebase is not configured on the server',
    })
  }

  return { apiKey, authDomain, projectId, appId }
})
