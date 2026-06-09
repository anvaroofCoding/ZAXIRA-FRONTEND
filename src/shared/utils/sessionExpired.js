import { clearCredentials } from '@/features/auth/model/authSlice'
import { SESSION_EXPIRED_MESSAGE } from '@/shared/constants/messages'

const SESSION_MESSAGE_KEY = 'zaxira_session_expired_message'
const AUTH_REQUESTS_TO_IGNORE = ['/auth/login', '/auth/me/password']

let redirecting = false

const getRequestUrl = (args) => {
  if (typeof args === 'string') return args
  return args?.url ?? ''
}

export const getApiErrorText = (error) => {
  const message = error?.data?.message

  if (Array.isArray(message)) {
    return message[0] ?? ''
  }

  if (typeof message === 'string') {
    return message
  }

  return ''
}

export const shouldHandleSessionExpired = (error, args, hadToken) => {
  if (!hadToken || error?.status !== 401) {
    return false
  }

  const url = getRequestUrl(args)

  if (AUTH_REQUESTS_TO_IGNORE.some((path) => url.includes(path))) {
    return false
  }

  const text = getApiErrorText(error)

  if (text === 'Joriy parol noto‘g‘ri') {
    return false
  }

  return true
}

export const readSessionExpiredMessage = () => {
  const message = sessionStorage.getItem(SESSION_MESSAGE_KEY)
  sessionStorage.removeItem(SESSION_MESSAGE_KEY)
  return message || SESSION_EXPIRED_MESSAGE
}

export const handleSessionExpired = (dispatch, message) => {
  if (redirecting) {
    return
  }

  redirecting = true
  dispatch(clearCredentials())
  sessionStorage.setItem(SESSION_MESSAGE_KEY, message || SESSION_EXPIRED_MESSAGE)
  window.location.replace('/403')
}
