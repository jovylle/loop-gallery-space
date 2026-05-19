/** Manual key=value parse (avoid URLSearchParams — corrupts JWT `+` in query strings). */
function parseBridgeParams(body: string) {
  let googleIdToken: string | null = null
  let googleAccessToken: string | null = null

  for (const part of body.split('&')) {
    if (!part) continue
    const eq = part.indexOf('=')
    if (eq === -1) continue
    const key = part.slice(0, eq)
    const value = decodeURIComponent(part.slice(eq + 1))
    if (key === 'gid') googleIdToken = value
    if (key === 'gat') googleAccessToken = value
  }

  return { googleIdToken, googleAccessToken }
}

/** Build query string for OAuth bridge (?gid=…&gat=…). Survives Android App Link intents (hash is stripped). */
export function buildOAuthBridgeQuery(tokens: { googleIdToken?: string | null, googleAccessToken?: string | null }) {
  const parts: string[] = []
  if (tokens.googleIdToken) {
    parts.push(`gid=${encodeURIComponent(tokens.googleIdToken)}`)
  }
  if (tokens.googleAccessToken) {
    parts.push(`gat=${encodeURIComponent(tokens.googleAccessToken)}`)
  }
  return parts.length ? `?${parts.join('&')}` : ''
}

/** Build hash fragment for OAuth bridge (#gid=…). Fallback for in-tab handoff. */
export function buildOAuthBridgeHash(tokens: { googleIdToken?: string | null, googleAccessToken?: string | null }) {
  const q = buildOAuthBridgeQuery(tokens)
  return q ? `#${q.slice(1)}` : ''
}

/** Parse query string from OAuth bridge. */
export function parseOAuthBridgeSearch(search: string) {
  const body = search.startsWith('?') ? search.slice(1) : search
  return parseBridgeParams(body)
}

/** Parse hash fragment from OAuth bridge. */
export function parseOAuthBridgeHash(hash: string) {
  const body = hash.startsWith('#') ? hash.slice(1) : hash
  return parseBridgeParams(body)
}

/** Prefer query (app deep link), then hash (Custom Tab). */
export function readOAuthBridgeTokens() {
  if (typeof window === 'undefined') {
    return { googleIdToken: null, googleAccessToken: null }
  }
  if (window.location.search) {
    return parseOAuthBridgeSearch(window.location.search)
  }
  if (window.location.hash) {
    return parseOAuthBridgeHash(window.location.hash)
  }
  return { googleIdToken: null, googleAccessToken: null }
}

export function isLikelyGoogleIdToken(token: string | null | undefined): token is string {
  if (!token?.trim()) return false
  return token.trim().split('.').length === 3
}

/** True when the URL is Firebase redirecting back after Google OAuth (not a fresh visit). */
export function isFirebaseRedirectReturn(): boolean {
  if (typeof window === 'undefined') return false
  const params = `${window.location.search}${window.location.hash}`
  return /(?:^|[?&#])(apiKey|authType|mode)=/.test(params)
}
