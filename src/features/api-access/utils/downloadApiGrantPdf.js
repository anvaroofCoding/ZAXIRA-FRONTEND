import { env } from '@/shared/config/env'
import { getDeviceHeaders } from '@/shared/utils/deviceIdentity'

export const downloadApiGrantPdf = async ({ grantId, fileName, plainKey } = {}) => {
  const token = localStorage.getItem('zaxira_access_token')
  const params = new URLSearchParams()
  if (plainKey?.trim()) {
    params.set('plainKey', plainKey.trim())
  }

  const query = params.toString()
  const response = await fetch(
    `${env.apiBaseUrl}/api-access/grants/${grantId}/pdf${query ? `?${query}` : ''}`,
    {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...getDeviceHeaders(),
      },
    },
  )

  if (!response.ok) {
    throw new Error('PDF yuklab bo‘lmadi')
  }

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName || `api-berish-${grantId}.pdf`
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
