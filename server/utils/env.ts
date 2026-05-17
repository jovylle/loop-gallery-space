/** Read env vars on Cloudflare Workers (dashboard secrets) with local fallbacks. */
export function getWorkerEnv(event: H3Event, key: string): string {
  const cfEnv = (event.context as { cloudflare?: { env?: Record<string, unknown> } }).cloudflare?.env
  const fromBinding = cfEnv?.[key]
  if (fromBinding != null && String(fromBinding) !== '') {
    return String(fromBinding)
  }
  return process.env[key] || ''
}
