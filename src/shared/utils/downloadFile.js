import { env } from '@/shared/config/env'
import { store } from '@/app/store/store'
import { selectAccessToken } from '@/features/auth/model/authSlice'
import {
  getApiErrorText,
  handleSessionExpired,
  shouldHandleSessionExpired,
} from '@/shared/utils/sessionExpired'

export const downloadAuthenticatedFile = async (path, filename) => {
  const token = selectAccessToken(store.getState())
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    let message = 'Faylni yuklab olishda xatolik'
    let payload = null

    try {
      payload = await response.json()
      const rawMessage = payload?.message ?? payload?.error ?? message
      message = Array.isArray(rawMessage) ? rawMessage[0] ?? message : rawMessage
    } catch {
      // ignore parse errors
    }

    const error = { status: response.status, data: payload ?? { message } }

    if (shouldHandleSessionExpired(error, path, Boolean(token))) {
      handleSessionExpired(store.dispatch, getApiErrorText(error))
      return
    }

    throw new Error(message)
  }

  const blob = await response.blob()
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(url)
}
