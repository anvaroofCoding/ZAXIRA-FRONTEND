import { env } from '@/shared/config/env'

const HEALTH_URL = `${env.apiBaseUrl}/health`
const SPEED_TEST_URL = `${env.apiBaseUrl}/health/speed-test?kb=256`
const SPEED_TEST_QUICK_URL = `${env.apiBaseUrl}/health/speed-test?kb=128`

export const IT_TEAM_PREFIX = 'IT jamoasi: '

export const SPEED_WARNING_THRESHOLDS = {
  critical: 1,
  low: 5,
}

const median = (values) => {
  if (!values.length) return 0
  const sorted = [...values].sort((a, b) => a - b)
  return sorted[Math.floor(sorted.length / 2)]
}

const fetchWithTiming = async (url, options = {}) => {
  const start = performance.now()
  const response = await fetch(url, {
    cache: 'no-store',
    ...options,
  })

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`)
  }

  const body = await response.arrayBuffer()
  const durationMs = performance.now() - start

  return { body, durationMs, byteLength: body.byteLength }
}

export const getLatencyLabel = (ms) => {
  if (ms < 50) return { label: 'Juda yaxshi', color: 'success' }
  if (ms < 100) return { label: 'Yaxshi', color: 'success' }
  if (ms < 200) return { label: "O'rtacha", color: 'warning' }
  if (ms < 500) return { label: 'Sekin', color: 'warning' }
  return { label: 'Juda sekin', color: 'error' }
}

export const getDownloadLabel = (mbps) => {
  if (mbps >= 50) return { label: 'Juda tez', color: 'success' }
  if (mbps >= 25) return { label: 'Tez', color: 'success' }
  if (mbps >= 10) return { label: "O'rtacha", color: 'warning' }
  if (mbps >= 5) return { label: 'Sekin', color: 'warning' }
  return { label: 'Juda sekin', color: 'error' }
}

export const buildSpeedWarningMessage = (mbps) => {
  const rounded = Math.round(mbps * 10) / 10
  const speedText =
    mbps <= SPEED_WARNING_THRESHOLDS.critical
      ? `${rounded} Mbit/s (1 Mbit/s dan past)`
      : `${rounded} Mbit/s (5 Mbit/s gacha)`

  return `${IT_TEAM_PREFIX}Internet tezligi past (${speedText}). Bunday internet tezligi bilan ma’lumotlar qotib, xato yuklanib qolmasligi uchun internet tezligini oshirishingizni so‘raymiz!`
}

export const getSpeedWarning = (mbps) => {
  if (!Number.isFinite(mbps) || mbps <= 0) return null

  if (mbps <= SPEED_WARNING_THRESHOLDS.critical) {
    return {
      level: 'critical',
      severity: 'error',
      message: buildSpeedWarningMessage(mbps),
    }
  }

  if (mbps <= SPEED_WARNING_THRESHOLDS.low) {
    return {
      level: 'low',
      severity: 'warning',
      message: buildSpeedWarningMessage(mbps),
    }
  }

  return null
}

export async function checkConnectivity({ signal, timeoutMs = 8000 } = {}) {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const start = performance.now()
    const response = await fetch(HEALTH_URL, {
      cache: 'no-store',
      signal: controller.signal,
    })

    if (!response.ok) {
      return { online: false }
    }

    await response.arrayBuffer()
    return {
      online: true,
      latencyMs: Math.round(performance.now() - start),
    }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error
    }
    return { online: false }
  } finally {
    clearTimeout(timeoutId)
    signal?.removeEventListener('abort', onAbort)
  }
}

export async function measureQuickDownloadSpeed({ signal } = {}) {
  try {
    const { durationMs, byteLength } = await fetchWithTiming(SPEED_TEST_QUICK_URL, { signal })
    const durationSec = durationMs / 1000
    const downloadMbps =
      durationSec > 0
        ? Math.round(((byteLength * 8) / durationSec / 1_000_000) * 10) / 10
        : 0

    return { downloadMbps }
  } catch (error) {
    if (error?.name === 'AbortError') {
      throw error
    }
    return { downloadMbps: null }
  }
}

export async function runQuickInternetCheck({ signal } = {}) {
  const connectivity = await checkConnectivity({ signal })
  if (!connectivity.online) {
    return { online: false, latencyMs: null, downloadMbps: null }
  }

  const { downloadMbps } = await measureQuickDownloadSpeed({ signal })
  return {
    online: true,
    latencyMs: connectivity.latencyMs,
    downloadMbps,
  }
}

export async function runInternetSpeedTest({ signal } = {}) {
  const latencySamples = []

  for (let i = 0; i < 5; i += 1) {
    if (signal?.aborted) {
      throw new DOMException('Aborted', 'AbortError')
    }

    const { durationMs, byteLength } = await fetchWithTiming(HEALTH_URL, { signal })
    if (byteLength > 0) {
      latencySamples.push(durationMs)
    }
  }

  const latencyMs = Math.round(median(latencySamples))

  const { body, durationMs: downloadMs, byteLength } = await fetchWithTiming(SPEED_TEST_URL, {
    signal,
  })

  const durationSec = downloadMs / 1000
  const downloadMbps =
    durationSec > 0
      ? Math.round(((byteLength * 8) / durationSec / 1_000_000) * 10) / 10
      : 0

  return {
    latencyMs,
    downloadMbps,
    testedAt: new Date().toISOString(),
  }
}
