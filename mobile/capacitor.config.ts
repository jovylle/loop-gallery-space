import type { CapacitorConfig } from '@capacitor/cli'

/**
 * LoopGallery Android shell loads the deployed Nuxt app (Cloudflare Workers).
 * The main site build/deploy is unchanged — see repo root package.json.
 *
 * Dev: CAPACITOR_SERVER_URL=http://10.0.2.2:3000 npm run sync (Android emulator → host machine)
 * Prod: uses production URL below (override with CAPACITOR_SERVER_URL if needed).
 */
const productionUrl = 'https://loopgallery.a-u.us'
const serverUrl = process.env.CAPACITOR_SERVER_URL || productionUrl
const useRemoteServer = Boolean(serverUrl)

/** Play Console privacy policy URL (must match deployed site). */
export const PRIVACY_POLICY_URL = `${productionUrl}/privacy`

const config: CapacitorConfig = {
  appId: 'us.a_u.loopgallery.app',
  appName: 'LoopGallery',
  webDir: 'www',
  android: {
    allowMixedContent: false,
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      androidSplashResourceName: 'splash',
      showSpinner: false,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0a0a0f',
      overlaysWebView: false,
    },
    FirebaseAuthentication: {
      skipNativeAuth: false,
      providers: ['google.com'],
    },
  },
  ...(useRemoteServer
    ? {
        server: {
          url: serverUrl,
          cleartext: serverUrl.startsWith('http://'),
          androidScheme: 'https',
          // Keep tenant subdomains (user.loopgallery.a-u.us) inside the WebView.
          allowNavigation: [
            new URL(productionUrl).hostname,
            `*.${new URL(productionUrl).hostname}`,
            '*.firebaseapp.com',
            '*.google.com',
            'accounts.google.com',
          ],
        },
      }
    : {}),
}

export default config
