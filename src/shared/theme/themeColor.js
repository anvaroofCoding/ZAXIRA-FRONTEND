export const DEFAULT_PRIMARY_COLOR = '#1565c0'
export const THEME_COLOR_STORAGE_KEY = 'zaxira-theme-primary'
export const THEME_COLOR_CHANGED = 'zaxira:theme-color-changed'

export const THEME_COLOR_PRESETS = [
  { label: 'Ko‘k', value: '#1565c0' },
  { label: 'Yashil', value: '#2e7d32' },
  { label: 'Binafsha', value: '#6a1b9a' },
  { label: 'Qizil', value: '#c62828' },
  { label: 'To‘q sariq', value: '#ef6c00' },
  { label: 'Ko‘k-yashil', value: '#00838f' },
  { label: 'Pushti', value: '#ad1457' },
  { label: 'Kulrang', value: '#455a64' },
]

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/

export const normalizeThemeColor = (value) => {
  if (typeof value !== 'string') return DEFAULT_PRIMARY_COLOR

  const trimmed = value.trim()
  if (HEX_COLOR_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (HEX_COLOR_PATTERN.test(withHash)) {
    return withHash.toLowerCase()
  }

  return DEFAULT_PRIMARY_COLOR
}

export const getStoredThemeColor = () => {
  try {
    const stored = localStorage.getItem(THEME_COLOR_STORAGE_KEY)
    return stored ? normalizeThemeColor(stored) : DEFAULT_PRIMARY_COLOR
  } catch {
    return DEFAULT_PRIMARY_COLOR
  }
}

export const setStoredThemeColor = (value) => {
  const normalized = normalizeThemeColor(value)
  localStorage.setItem(THEME_COLOR_STORAGE_KEY, normalized)
  window.dispatchEvent(new Event(THEME_COLOR_CHANGED))
  return normalized
}

export const resetStoredThemeColor = () => {
  localStorage.removeItem(THEME_COLOR_STORAGE_KEY)
  window.dispatchEvent(new Event(THEME_COLOR_CHANGED))
  return DEFAULT_PRIMARY_COLOR
}
