import { useCallback, useEffect, useState } from 'react'
import {
  USER_PREFERENCES_CHANGED,
  getChatToastEnabled,
  getNotificationToastEnabled,
  setChatToastEnabled,
  setNotificationToastEnabled,
} from '@/shared/utils/userPreferences'

export const useUserPreferences = () => {
  const [notificationToast, setNotificationToastState] = useState(getNotificationToastEnabled)
  const [chatToast, setChatToastState] = useState(getChatToastEnabled)

  useEffect(() => {
    const sync = () => {
      setNotificationToastState(getNotificationToastEnabled())
      setChatToastState(getChatToastEnabled())
    }

    window.addEventListener(USER_PREFERENCES_CHANGED, sync)
    return () => window.removeEventListener(USER_PREFERENCES_CHANGED, sync)
  }, [])

  const setNotificationToast = useCallback((enabled) => {
    setNotificationToastEnabled(enabled)
    setNotificationToastState(enabled)
  }, [])

  const setChatToast = useCallback((enabled) => {
    setChatToastEnabled(enabled)
    setChatToastState(enabled)
  }, [])

  return {
    notificationToast,
    chatToast,
    setNotificationToast,
    setChatToast,
  }
}
