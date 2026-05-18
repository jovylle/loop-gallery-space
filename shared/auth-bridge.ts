/** Build hash fragment for OAuth bridge (avoid URLSearchParams — breaks JWT +). */
export function buildOAuthBridgeHash(tokens: { googleIdToken?: string | null, googleAccessToken?: string | null }) {
  const parts: string[] = []
  if (tokens.googleIdToken) {
    parts.push(`gid=${encodeURIComponent(tokens.googleIdToken)}`)
  }
  if (tokens.googleAccessToken) {
    parts.push(`gat=${encodeURIComponent(tokens.googleAccessToken)}`)
  }
  return parts.length ? `#${parts.join('&')}` : ''
}

/** Parse hash fragment from OAuth bridge. */
export function parseOAuthBridgeHash(hash: string) {
  const body = hash.startsWith('#') ? hash.slice(1) : hash
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
