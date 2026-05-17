import type { QuotaUsage } from '~/shared/types'
import { formatUploadError } from '~/shared/upload-errors'

export function useQuota() {
  const { apiFetch } = useAuth()
  const usage = useState<QuotaUsage | null>('quota-usage', () => null)

  async function refreshQuota() {
    usage.value = await apiFetch<QuotaUsage>('/api/quota')
    return usage.value
  }

  function uploadsRemaining(q: QuotaUsage) {
    return Math.max(0, q.uploadsPerDayMax - q.uploadsToday)
  }

  return {
    usage,
    refreshQuota,
    uploadsRemaining,
    formatUploadError,
  }
}
