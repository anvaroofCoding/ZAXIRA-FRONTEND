import { PERMISSION_DENIED_MESSAGE } from '@/shared/constants/messages'

export const getApiErrorMessage = (error, fallback = 'Xatolik yuz berdi') => {
  if (error?.status === 403) {
    return error?.data?.message || PERMISSION_DENIED_MESSAGE
  }

  const message = error?.data?.message

  if (Array.isArray(message) && message[0]) {
    return message[0]
  }

  if (typeof message === 'string' && message) {
    return message
  }

  return fallback
}
