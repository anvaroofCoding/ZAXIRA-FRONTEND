import { useEffect, useRef, useState } from 'react'
import { selectAccessToken } from '@/features/auth/model/authSlice'
import {
  checkConnectivity,
  getSpeedWarning,
  IT_TEAM_PREFIX,
  measureQuickDownloadSpeed,
} from '@/features/settings/utils/internetSpeedTest'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { showNotification } from '@/shared/model/notificationSlice'

const ONLINE_CHECK_INTERVAL_MS = 90_000
const OFFLINE_CHECK_INTERVAL_MS = 15_000
const WARNING_COOLDOWN_MS = 10 * 60_000
const OFFLINE_STRIKE_THRESHOLD = 2
const INITIAL_CHECK_DELAY_MS = 2500

export const useInternetMonitor = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)
  const [isOnline, setIsOnline] = useState(true)

  const wasOnlineRef = useRef(true)
  const offlineStrikesRef = useRef(0)
  const lastWarningRef = useRef({ level: null, at: 0 })
  const abortRef = useRef(null)
  const timerRef = useRef(null)

  useEffect(() => {
    const handleBrowserOffline = () => {
      offlineStrikesRef.current = OFFLINE_STRIKE_THRESHOLD
      setIsOnline(false)
      if (wasOnlineRef.current) {
        dispatch(
          showNotification({
            severity: 'error',
            message: `${IT_TEAM_PREFIX}Internet ishlamayapdi. Aloqani tekshiring.`,
            duration: 10000,
          }),
        )
        wasOnlineRef.current = false
      }
    }

    const handleBrowserOnline = () => {
      offlineStrikesRef.current = 0
      setIsOnline(true)
      wasOnlineRef.current = true
    }

    window.addEventListener('online', handleBrowserOnline)
    window.addEventListener('offline', handleBrowserOffline)

    return () => {
      window.removeEventListener('online', handleBrowserOnline)
      window.removeEventListener('offline', handleBrowserOffline)
    }
  }, [dispatch])

  useEffect(() => {
    let cancelled = false

    const clearTimer = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    const scheduleNext = (delay) => {
      clearTimer()
      timerRef.current = setTimeout(() => {
        void runCheck()
      }, delay)
    }

    const markOnline = () => {
      offlineStrikesRef.current = 0
      setIsOnline(true)
      wasOnlineRef.current = true
    }

    const markOffline = () => {
      offlineStrikesRef.current += 1

      if (offlineStrikesRef.current < OFFLINE_STRIKE_THRESHOLD) {
        scheduleNext(OFFLINE_CHECK_INTERVAL_MS)
        return
      }

      setIsOnline(false)

      if (wasOnlineRef.current) {
        dispatch(
          showNotification({
            severity: 'error',
            message: `${IT_TEAM_PREFIX}Internet ishlamayapdi. Aloqani tekshiring.`,
            duration: 10000,
          }),
        )
        wasOnlineRef.current = false
      }

      scheduleNext(OFFLINE_CHECK_INTERVAL_MS)
    }

    const notifySpeedWarning = (warning) => {
      const now = Date.now()
      const last = lastWarningRef.current
      const recentlyNotified =
        last.level === warning.level && now - last.at < WARNING_COOLDOWN_MS

      if (recentlyNotified) return

      dispatch(
        showNotification({
          severity: warning.severity,
          message: warning.message,
          duration: 14000,
        }),
      )
      lastWarningRef.current = { level: warning.level, at: now }
    }

    const runCheck = async () => {
      if (cancelled) return

      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller

      try {
        if (!navigator.onLine) {
          markOffline()
          return
        }

        const connectivity = await checkConnectivity({ signal: controller.signal })
        if (cancelled || controller.signal.aborted) return

        if (!connectivity.online) {
          markOffline()
          return
        }

        markOnline()

        if (token) {
          try {
            const speed = await measureQuickDownloadSpeed({ signal: controller.signal })
            if (cancelled || controller.signal.aborted) return

            if (speed.downloadMbps != null) {
              const warning = getSpeedWarning(speed.downloadMbps)
              if (warning) {
                notifySpeedWarning(warning)
              } else {
                lastWarningRef.current = { level: null, at: 0 }
              }
            }
          } catch (error) {
            if (error?.name === 'AbortError' || cancelled) return
          }
        }

        scheduleNext(ONLINE_CHECK_INTERVAL_MS)
      } catch (error) {
        if (error?.name === 'AbortError' || cancelled) return
        markOffline()
      }
    }

    scheduleNext(INITIAL_CHECK_DELAY_MS)

    return () => {
      cancelled = true
      clearTimer()
      abortRef.current?.abort()
    }
  }, [dispatch, token])

  return { isOnline }
}
