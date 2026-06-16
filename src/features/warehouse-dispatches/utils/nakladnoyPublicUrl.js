import { env } from '@/shared/config/env'

export const buildNakladnoyPublicUrl = (dispatchId) => {
  if (!dispatchId) return ''

  const base = env.appPublicUrl.replace(/\/$/, '')
  return `${base}/public/nakladnoy/${dispatchId}/pdf`
}
