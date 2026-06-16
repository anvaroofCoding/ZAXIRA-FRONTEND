const FAILED_ATTEMPT_LIMIT = 5
const RAPID_ATTEMPT_GAP_MS = 2000
const BLOCK_DURATION_SEC = 30

const STORAGE_KEYS = {
  attemptCount: 'zaxira_login_failed_count',
  lastAttemptAt: 'zaxira_login_failed_last_at',
  lockUntil: 'zaxira_login_attempt_lock_until',
}

const parseLockUntil = (value) => {
  if (!value) return null
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return null
  if (timestamp <= Date.now()) return null
  return timestamp
}

export const getAttemptLockUntil = () =>
  parseLockUntil(window.localStorage.getItem(STORAGE_KEYS.lockUntil))

export const clearAttemptLock = () => {
  window.localStorage.removeItem(STORAGE_KEYS.lockUntil)
  window.sessionStorage.removeItem(STORAGE_KEYS.attemptCount)
  window.sessionStorage.removeItem(STORAGE_KEYS.lastAttemptAt)
}

/**
 * Noto‘g‘ri login urinishini qayd etadi.
 * 2 soniyadan kam oraliq bilan ketma-ket 5 marta xato bo‘lsa, API 30 soniyaga bloklanadi.
 */
export const recordFailedLoginAttempt = () => {
  const activeLockUntil = getAttemptLockUntil()
  if (activeLockUntil) {
    return {
      triggered: false,
      lockUntil: activeLockUntil,
      blockDurationSec: null,
    }
  }

  const now = Date.now()
  const lastAttemptAt = Number.parseInt(
    window.sessionStorage.getItem(STORAGE_KEYS.lastAttemptAt) ?? '0',
    10,
  )
  const previousCount = Number.parseInt(
    window.sessionStorage.getItem(STORAGE_KEYS.attemptCount) ?? '0',
    10,
  )

  const isRapidAttempt =
    Number.isFinite(lastAttemptAt) &&
    lastAttemptAt > 0 &&
    now - lastAttemptAt < RAPID_ATTEMPT_GAP_MS

  const nextCount = isRapidAttempt
    ? (Number.isFinite(previousCount) ? previousCount : 0) + 1
    : 1

  window.sessionStorage.setItem(STORAGE_KEYS.lastAttemptAt, String(now))

  if (nextCount < FAILED_ATTEMPT_LIMIT) {
    window.sessionStorage.setItem(STORAGE_KEYS.attemptCount, String(nextCount))
    return {
      triggered: false,
      lockUntil: null,
      blockDurationSec: null,
      attemptCount: nextCount,
    }
  }

  window.sessionStorage.setItem(STORAGE_KEYS.attemptCount, '0')

  const lockUntil = Date.now() + BLOCK_DURATION_SEC * 1000
  window.localStorage.setItem(
    STORAGE_KEYS.lockUntil,
    new Date(lockUntil).toISOString(),
  )

  return {
    triggered: true,
    lockUntil,
    blockDurationSec: BLOCK_DURATION_SEC,
    attemptCount: FAILED_ATTEMPT_LIMIT,
  }
}
