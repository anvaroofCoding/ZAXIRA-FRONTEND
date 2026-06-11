import { env } from '@/shared/config/env'
import { store } from '@/app/store/store'
import { selectAccessToken } from '@/features/auth/model/authSlice'
import {
  getApiErrorText,
  handleSessionExpired,
  shouldHandleSessionExpired,
} from '@/shared/utils/sessionExpired'

export const fetchSessionDocumentFile = async (sessionId, docType) => {
  const token = selectAccessToken(store.getState())
  const path = `/purchase-requests/active-sessions/${sessionId}/documents/${docType}/download`

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    let message = 'Hujjatni yuklab bo‘lmadi'
    let payload = null

    try {
      payload = await response.json()
      const rawMessage = payload?.message ?? payload?.error ?? message
      message = Array.isArray(rawMessage) ? rawMessage[0] ?? message : rawMessage
    } catch {
      // ignore
    }

    const error = { status: response.status, data: payload ?? { message } }

    if (shouldHandleSessionExpired(error, path, Boolean(token))) {
      handleSessionExpired(store.dispatch, getApiErrorText(error))
      throw new Error(message)
    }

    throw new Error(message)
  }

  const blob = await response.blob()
  return new File([blob], `${docType}.docx`, {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
}
