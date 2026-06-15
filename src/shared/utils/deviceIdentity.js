const DEVICE_ID_STORAGE_KEY = 'zaxira_device_id'

const createDeviceId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `device-${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const getDeviceId = () => {
  if (typeof window === 'undefined') {
    return ''
  }

  const existing = window.localStorage.getItem(DEVICE_ID_STORAGE_KEY)
  if (existing?.trim()) {
    return existing.trim()
  }

  const nextId = createDeviceId()
  window.localStorage.setItem(DEVICE_ID_STORAGE_KEY, nextId)
  return nextId
}

export const getDeviceName = () => {
  if (typeof navigator === 'undefined') {
    return 'Noma’lum qurilma'
  }

  const platform =
    navigator.userAgentData?.platform?.trim() ||
    navigator.platform?.trim() ||
    'Noma’lum platforma'

  const userAgent = navigator.userAgent || ''
  let browser = 'Brauzer'

  if (userAgent.includes('Edg/')) {
    browser = 'Edge'
  } else if (userAgent.includes('OPR/') || userAgent.includes('Opera')) {
    browser = 'Opera'
  } else if (userAgent.includes('Firefox/')) {
    browser = 'Firefox'
  } else if (userAgent.includes('Chrome/')) {
    browser = 'Chrome'
  } else if (userAgent.includes('Safari/')) {
    browser = 'Safari'
  }

  return `${browser} · ${platform}`
}

export const getDeviceHeaders = () => {
  const deviceId = getDeviceId()
  const deviceName = getDeviceName()

  return {
    'X-Device-Id': deviceId,
    'X-Device-Name': deviceName,
  }
}
