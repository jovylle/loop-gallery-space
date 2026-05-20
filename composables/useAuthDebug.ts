/** On-screen OAuth debug log (auth/mobile, /__/auth/handler, /auth/complete). */
export function useAuthDebug(screen: string) {
  const lines = useState<string[]>('auth-debug-lines', () => [])

  function log(message: string) {
    const stamp = new Date().toISOString().slice(11, 23)
    const line = `${stamp} [${screen}] ${message}`
    lines.value = [...lines.value, line]
    if (import.meta.client) {
      console.info(`[AuthDebug] ${line}`)
    }
  }

  function clear() {
    lines.value = []
  }

  function redactUrl(raw: string): string {
    try {
      const u = new URL(raw)
      for (const key of ['gid', 'gat', 'code', 'access_token', 'id_token']) {
        if (u.searchParams.has(key)) {
          const v = u.searchParams.get(key) || ''
          u.searchParams.set(key, v ? `${v.slice(0, 12)}…(${v.length})` : '')
        }
      }
      if (u.hash) {
        u.hash = u.hash.length > 80 ? `${u.hash.slice(0, 40)}…(${u.hash.length})` : u.hash
      }
      return u.toString()
    }
    catch {
      return raw.slice(0, 120)
    }
  }

  function snapshotUrl(label = 'location') {
    if (!import.meta.client) return
    log(`${label}: ${redactUrl(window.location.href)}`)
    log(`${label} path: ${window.location.pathname}`)
    const keys = [...new URLSearchParams(window.location.search).keys()]
    log(`${label} query keys: ${keys.length ? keys.join(', ') : '(none)'}`)
    log(`${label} hash len: ${window.location.hash.length}`)
  }

  function snapshotClient() {
    if (!import.meta.client) return
    const { isCapacitorNative } = useCapacitor()
    log(`capacitor native: ${isCapacitorNative()}`)
    log(`userAgent: ${navigator.userAgent.slice(0, 100)}`)
    log(`session lg-oauth-session: ${sessionStorage.getItem('lg-oauth-session') ?? '(unset)'}`)
    log(`session lg-oauth-handler-tried: ${sessionStorage.getItem('lg-oauth-handler-tried') ?? '(unset)'}`)
  }

  function snapshotFirebase() {
    const { $firebaseAuth } = useNuxtApp()
    const config = useRuntimeConfig()
    if ($firebaseAuth) {
      log(`firebase authDomain: ${$firebaseAuth.app.options.authDomain ?? '?'}`)
      log(`firebase currentUser: ${$firebaseAuth.currentUser?.uid ?? 'null'}`)
    }
    else {
      log('firebase auth: null')
    }
    log(`runtime firebaseAuthDomain: ${config.public.firebaseAuthDomain || '(empty)'}`)
  }

  function snapshotOAuthQuery() {
    if (!import.meta.client) return
    const p = new URLSearchParams(window.location.search)
    for (const key of ['authType', 'redirectUrl', 'providerId', 'apiKey', 'eventId']) {
      const v = p.get(key)
      if (v) log(`query.${key}=${key === 'apiKey' ? `${v.slice(0, 8)}…` : v}`)
    }
  }

  function firebaseError(e: unknown): string {
    if (e && typeof e === 'object') {
      const o = e as { code?: string, message?: string }
      return [o.code, o.message].filter(Boolean).join(' — ') || String(e)
    }
    return e instanceof Error ? e.message : String(e)
  }

  return {
    lines,
    log,
    clear,
    redactUrl,
    snapshotUrl,
    snapshotClient,
    snapshotFirebase,
    snapshotOAuthQuery,
    firebaseError,
  }
}
