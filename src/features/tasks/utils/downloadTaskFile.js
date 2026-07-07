import { env } from '@/shared/config/env'
import { getDeviceHeaders } from '@/shared/utils/deviceIdentity'

export const downloadTaskFile = async (taskId, fileName, storedName) => {
  const token = localStorage.getItem('zaxira_access_token')
  const params = storedName ? `?storedName=${encodeURIComponent(storedName)}` : ''
  const response = await fetch(`${env.apiBaseUrl}/tasks/${taskId}/file${params}`, {
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...getDeviceHeaders(),
    },
  })

  if (!response.ok) {
    throw new Error('Faylni yuklab bo‘lmadi')
  }

  const blob = await response.blob()
  const blobUrl = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = blobUrl
  link.download = fileName || 'vazifa-fayli'
  document.body.appendChild(link)
  link.click()
  link.remove()
  window.URL.revokeObjectURL(blobUrl)
}
