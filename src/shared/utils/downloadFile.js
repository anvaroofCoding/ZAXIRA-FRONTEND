import { env } from '@/shared/config/env'
import { store } from '@/app/store/store'
import { selectAccessToken } from '@/features/auth/model/authSlice'

export const downloadAuthenticatedFile = async (path, filename) => {
  const token = selectAccessToken(store.getState())
  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!response.ok) {
    let message = 'Faylni yuklab olishda xatolik'

    try {
      const payload = await response.json()
      message = payload?.message ?? payload?.error ?? message
    } catch {
      // ignore parse errors
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
