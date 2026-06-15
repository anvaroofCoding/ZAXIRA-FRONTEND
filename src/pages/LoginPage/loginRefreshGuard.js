const REFRESH_LIMIT = 10

/** 1-chi: 10s, 2-chi: 30s, 3-chi: 60s, 4-chi: 2min, 5-chi: 5min, keyin yana 10s dan */
export const REFRESH_BLOCK_DURATIONS_SEC = [10, 30, 60, 120, 300]

const STORAGE_KEYS = {
  refreshCount: 'zaxira_login_refresh_count',
  escalation: 'zaxira_login_refresh_escalation',
  lockUntil: 'zaxira_login_refresh_lock_until',
  visited: 'zaxira_login_refresh_seen',
}

const parseLockUntil = (value) => {
  if (!value) return null
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return null
  if (timestamp <= Date.now()) return null
  return timestamp
}

const readEscalationLevel = () => {
  const parsed = Number.parseInt(
    window.localStorage.getItem(STORAGE_KEYS.escalation) ?? '0',
    10,
  )
  if (!Number.isFinite(parsed) || parsed < 0) return 0
  if (parsed >= REFRESH_BLOCK_DURATIONS_SEC.length) {
    return 0
  }
  return parsed
}

const writeEscalationLevel = (level) => {
  window.localStorage.setItem(STORAGE_KEYS.escalation, String(level))
}

export const getRefreshLockUntil = () =>
  parseLockUntil(window.localStorage.getItem(STORAGE_KEYS.lockUntil))

export const clearExpiredRefreshLock = () => {
  const lockUntil = getRefreshLockUntil()
  if (!lockUntil) {
    window.localStorage.removeItem(STORAGE_KEYS.lockUntil)
  }
  return lockUntil
}

/**
 * Login sahifasi yuklanganda chaqiriladi.
 * 10 marta ketma-ket refresh bo‘lsa, blok vaqti qo‘llanadi.
 */
export const recordLoginPageRefresh = () => {
  clearExpiredRefreshLock()

  const activeLockUntil = getRefreshLockUntil()
  if (activeLockUntil) {
    return {
      triggered: false,
      lockUntil: activeLockUntil,
      blockDurationSec: null,
    }
  }

  const hasVisited = window.sessionStorage.getItem(STORAGE_KEYS.visited)
  if (!hasVisited) {
    window.sessionStorage.setItem(STORAGE_KEYS.visited, '1')
    return {
      triggered: false,
      lockUntil: null,
      blockDurationSec: null,
      refreshCount: 0,
    }
  }

  const previousCount = Number.parseInt(
    window.sessionStorage.getItem(STORAGE_KEYS.refreshCount) ?? '0',
    10,
  )
  const nextCount = (Number.isFinite(previousCount) ? previousCount : 0) + 1

  if (nextCount < REFRESH_LIMIT) {
    window.sessionStorage.setItem(STORAGE_KEYS.refreshCount, String(nextCount))
    return {
      triggered: false,
      lockUntil: null,
      blockDurationSec: null,
      refreshCount: nextCount,
    }
  }

  window.sessionStorage.setItem(STORAGE_KEYS.refreshCount, '0')

  const escalationLevel = readEscalationLevel()
  const blockDurationSec = REFRESH_BLOCK_DURATIONS_SEC[escalationLevel]
  const lockUntil = Date.now() + blockDurationSec * 1000

  const nextEscalationLevel =
    escalationLevel >= REFRESH_BLOCK_DURATIONS_SEC.length - 1
      ? 0
      : escalationLevel + 1

  writeEscalationLevel(nextEscalationLevel)
  window.localStorage.setItem(
    STORAGE_KEYS.lockUntil,
    new Date(lockUntil).toISOString(),
  )

  return {
    triggered: true,
    lockUntil,
    blockDurationSec,
    refreshCount: REFRESH_LIMIT,
  }
}

export const clearRefreshLock = () => {
  window.localStorage.removeItem(STORAGE_KEYS.lockUntil)
}
