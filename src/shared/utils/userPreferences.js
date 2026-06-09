export const USER_PREFERENCES_CHANGED = 'zaxira:user-preferences-changed'

export const PREF_KEYS = {
  NOTIFICATION_TOAST: 'zaxira_pref_notification_toast',
  CHAT_TOAST: 'zaxira_pref_chat_toast',
}

const readBool = (key, defaultValue = true) => {
  try {
    const raw = localStorage.getItem(key)
    if (raw === 'true') return true
    if (raw === 'false') return false
  } catch {
    // ignore
  }
  return defaultValue
}

const writeBool = (key, value) => {
  localStorage.setItem(key, String(value))
  window.dispatchEvent(new Event(USER_PREFERENCES_CHANGED))
}

export const getNotificationToastEnabled = () =>
  readBool(PREF_KEYS.NOTIFICATION_TOAST, true)

export const setNotificationToastEnabled = (enabled) =>
  writeBool(PREF_KEYS.NOTIFICATION_TOAST, enabled)

export const getChatToastEnabled = () => readBool(PREF_KEYS.CHAT_TOAST, true)

export const setChatToastEnabled = (enabled) => writeBool(PREF_KEYS.CHAT_TOAST, enabled)
