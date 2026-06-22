import { detectProcessorInfo } from './detectProcessorInfo'

const toMb = (bytes) => Math.round(bytes / 1024 / 1024)

const readConnection = () => {
  if (typeof navigator === 'undefined') return null
  return navigator.connection || navigator.mozConnection || navigator.webkitConnection || null
}

export const collectDeviceTelemetry = async () => {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return null
  }

  const connection = readConnection()

  let storageUsedMb = null
  let storageQuotaMb = null
  let storageUsedPercent = null

  try {
    if (navigator.storage?.estimate) {
      const estimate = await navigator.storage.estimate()
      const usage = estimate.usage ?? 0
      const quota = estimate.quota ?? 0
      storageUsedMb = toMb(usage)
      storageQuotaMb = quota > 0 ? toMb(quota) : null
      storageUsedPercent = quota > 0 ? Math.round((usage / quota) * 100) : null
    }
  } catch {
    // Brauzer ruxsat bermasa o‘tkazib yuboriladi
  }

  const perfMemory = performance?.memory
  let memoryUsedPercent = null
  let jsHeapUsedMb = null
  let jsHeapLimitMb = null

  if (perfMemory?.usedJSHeapSize && perfMemory?.jsHeapSizeLimit) {
    jsHeapUsedMb = toMb(perfMemory.usedJSHeapSize)
    jsHeapLimitMb = toMb(perfMemory.jsHeapSizeLimit)
    memoryUsedPercent = Math.round(
      (perfMemory.usedJSHeapSize / perfMemory.jsHeapSizeLimit) * 100,
    )
  }

  const platform =
    navigator.userAgentData?.platform?.trim() ||
    navigator.platform?.trim() ||
    null

  const processorInfo = await detectProcessorInfo()

  return {
    ramGb: typeof navigator.deviceMemory === 'number' ? navigator.deviceMemory : null,
    cpuCores: processorInfo.cpuCores,
    processor: processorInfo.processor,
    processorModel: processorInfo.processorModel || null,
    processorArchitecture: processorInfo.processorArchitecture || null,
    processorPlatform: processorInfo.processorPlatform || platform,
    networkType: connection?.effectiveType ?? null,
    networkDownlinkMbps:
      typeof connection?.downlink === 'number' ? connection.downlink : null,
    networkRttMs: typeof connection?.rtt === 'number' ? connection.rtt : null,
    memoryUsedPercent,
    jsHeapUsedMb,
    jsHeapLimitMb,
    storageUsedMb,
    storageQuotaMb,
    storageUsedPercent,
    screenWidth: window.screen?.width ?? null,
    screenHeight: window.screen?.height ?? null,
    devicePixelRatio: window.devicePixelRatio ?? null,
    language: navigator.language ?? null,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone ?? null,
    collectedAt: new Date().toISOString(),
  }
}
