export const STATUS_COLOR_STORAGE_KEY = 'zaxira-status-colors'
export const STATUS_COLORS_CHANGED = 'zaxira:status-colors-changed'

/** Davlat tashkilotlari uchun rasmiy, xotirjam palitra */
export const DEFAULT_STATUS_COLORS = {
  success: '#1e5631',
  warning: '#9a7b2f',
  error: '#8c1d2a',
  info: '#3e5f7a',
  secondary: '#56657a',
}

export const STATUS_COLOR_KEYS = Object.keys(DEFAULT_STATUS_COLORS)

export const STATUS_COLOR_LABELS = {
  success: 'Muvaffaqiyat',
  warning: 'Kutilmoqda',
  error: 'Rad etilgan',
  info: 'Jarayonda',
  secondary: 'Kutish holati',
}

export const STATUS_COLOR_DESCRIPTIONS = {
  success: 'Yakunlangan, qabul qilingan holatlar',
  warning: 'Kutilayotgan yoki jarayondagi holatlar',
  error: 'Rad etilgan yoki xato holatlar',
  info: 'Maʼlumot va qisman holatlar',
  secondary: 'Ikkinchi darajali yoki nofaol holatlar',
}

export const STATUS_COLOR_PRESETS = [
  {
    label: 'Rasmiy',
    colors: { ...DEFAULT_STATUS_COLORS },
  },
  {
    label: 'Davlat yashil',
    colors: {
      success: '#1b4332',
      warning: '#8a6d3b',
      error: '#7d1e2a',
      info: '#2d4a6b',
      secondary: '#4a5d6c',
    },
  },
  {
    label: 'Konservativ',
    colors: {
      success: '#2d5a27',
      warning: '#7a6520',
      error: '#7a1f28',
      info: '#2c4a6b',
      secondary: '#4a5568',
    },
  },
  {
    label: 'Ko‘k ton',
    colors: {
      success: '#1a4d5c',
      warning: '#8b7355',
      error: '#8b2635',
      info: '#1e3a5f',
      secondary: '#5a6474',
    },
  },
]

const HEX_COLOR_PATTERN = /^#[0-9A-Fa-f]{6}$/

export const normalizeStatusColor = (value, fallback = DEFAULT_STATUS_COLORS.success) => {
  if (typeof value !== 'string') return fallback

  const trimmed = value.trim()
  if (HEX_COLOR_PATTERN.test(trimmed)) {
    return trimmed.toLowerCase()
  }

  const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`
  if (HEX_COLOR_PATTERN.test(withHash)) {
    return withHash.toLowerCase()
  }

  return fallback
}

export const normalizeStatusColors = (colors) => {
  const normalized = {}
  for (const key of STATUS_COLOR_KEYS) {
    normalized[key] = normalizeStatusColor(
      colors?.[key],
      DEFAULT_STATUS_COLORS[key],
    )
  }
  return normalized
}

export const getStoredStatusColors = () => {
  try {
    const stored = localStorage.getItem(STATUS_COLOR_STORAGE_KEY)
    if (!stored) return { ...DEFAULT_STATUS_COLORS }

    const parsed = JSON.parse(stored)
    return normalizeStatusColors(parsed)
  } catch {
    return { ...DEFAULT_STATUS_COLORS }
  }
}

export const setStoredStatusColors = (colors) => {
  const normalized = normalizeStatusColors(colors)
  localStorage.setItem(STATUS_COLOR_STORAGE_KEY, JSON.stringify(normalized))
  window.dispatchEvent(new Event(STATUS_COLORS_CHANGED))
  return normalized
}

export const resetStoredStatusColors = () => {
  localStorage.removeItem(STATUS_COLOR_STORAGE_KEY)
  window.dispatchEvent(new Event(STATUS_COLORS_CHANGED))
  return { ...DEFAULT_STATUS_COLORS }
}

export const isDefaultStatusColors = (colors) =>
  STATUS_COLOR_KEYS.every((key) => colors[key] === DEFAULT_STATUS_COLORS[key])
