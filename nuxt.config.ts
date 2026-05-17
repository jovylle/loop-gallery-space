import { firebaseWebConfig } from './shared/firebase.config'

export default defineNuxtConfig({
  compatibilityDate: '2025-04-01',
  devtools: { enabled: true },

  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/color-mode', '@nuxt/eslint'],

  colorMode: {
    classSuffix: '',
    preference: 'dark',
    fallback: 'dark',
  },

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      title: 'LoopGallery',
      meta: [
        { name: 'description', content: 'Your own corner of the internet — collect loops, memories, moods.' },
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
      firebaseAuthDomain: firebaseWebConfig.authDomain,
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
    },
  },

  routeRules: {
    '/dashboard/**': { ssr: false },
    '/login': { ssr: false },
  },
})
