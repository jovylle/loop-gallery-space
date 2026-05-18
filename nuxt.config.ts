import { firebaseWebConfig } from './shared/firebase.config'

const firebaseAuthDomain =
  process.env.NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN || firebaseWebConfig.authDomain

export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/eslint'],

  colorMode: {
    classSuffix: '',
    preference: 'light',
    fallback: 'light',
    storageKey: 'loopgallery-color-mode',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'LoopGallery',
      meta: [
        { name: 'description', content: 'Your own corner of the internet — collect loops, memories, moods.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'mobile-web-app-capable', content: 'yes' },
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=JetBrains+Mono:wght@400;500&display=swap',
        },
      ],
    },
  },

  runtimeConfig: {
    r2AccountId: process.env.R2_ACCOUNT_ID || '',
    r2AccessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    r2SecretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
    public: {
      firebaseApiKey: firebaseWebConfig.apiKey,
      firebaseAuthDomain,
      firebaseProjectId: firebaseWebConfig.projectId,
      firebaseAppId: firebaseWebConfig.appId,
      mediaBaseUrl: process.env.NUXT_PUBLIC_MEDIA_BASE_URL || '',
      siteUrl: process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      galleryHost: process.env.NUXT_PUBLIC_GALLERY_HOST || '',
    },
  },

  nitro: {
    preset: 'cloudflare_module',
    cloudflare: {
      deployConfig: true,
      nodeCompat: true,
      // Merged into generated .output/server/wrangler.json on deploy.
      // Without this, deployConfig emits "vars": {} and wipes dashboard variables.
      wrangler: {
        vars: {
          ...(process.env.NUXT_PUBLIC_GALLERY_HOST
            ? { NUXT_PUBLIC_GALLERY_HOST: process.env.NUXT_PUBLIC_GALLERY_HOST }
            : {}),
          ...(process.env.NUXT_PUBLIC_SITE_URL
            ? { NUXT_PUBLIC_SITE_URL: process.env.NUXT_PUBLIC_SITE_URL }
            : {}),
          ...(process.env.NUXT_PUBLIC_MEDIA_BASE_URL
            ? { NUXT_PUBLIC_MEDIA_BASE_URL: process.env.NUXT_PUBLIC_MEDIA_BASE_URL }
            : {}),
        },
      },
    },
  },

  routeRules: {
    '/dashboard/**': { ssr: false },
    '/login': { ssr: false },
    '/privacy': { prerender: true },
  },
})
