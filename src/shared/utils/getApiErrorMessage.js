import { PERMISSION_DENIED_MESSAGE } from '@/shared/constants/messages'

const extractMessage = (message) => {
  if (message && typeof message === 'object' && message.message) {
    return message.message
  }

  if (Array.isArray(message) && message[0]) {
    return message[0]
  }

  if (typeof message === 'string' && message) {
    return message
  }

  return ''
}

export const getApiErrorMessage = (error, fallback = 'Xatolik yuz berdi') => {
  const message = error?.data?.message
  const extracted = extractMessage(message)

  if (extracted) {
    return extracted
  }

  if (error?.status === 403) {
    return PERMISSION_DENIED_MESSAGE
  }

  return fallback
}
