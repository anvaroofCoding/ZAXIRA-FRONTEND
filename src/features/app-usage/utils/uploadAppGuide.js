import { env } from '@/shared/config/env'
import { getDeviceHeaders } from '@/shared/utils/deviceIdentity'

const parseUploadResponse = (xhr) => {
  let payload = null

  try {
    payload = xhr.responseText ? JSON.parse(xhr.responseText) : null
  } catch {
    payload = null
  }

  if (xhr.status >= 200 && xhr.status < 300) {
    if (payload && typeof payload === 'object' && 'success' in payload) {
      if (payload.success === false) {
        const message = Array.isArray(payload.message)
          ? payload.message.join(', ')
          : payload.message || 'Yuklashda xatolik'
        throw new Error(message)
      }

      return payload.data ?? payload
    }

    return payload
  }

  if (xhr.status === 413) {
    throw new Error('Video hajmi juda katta. Maksimal hajm: 400 MB.')
  }

  const message = Array.isArray(payload?.message)
    ? payload.message.join(', ')
    : payload?.message || 'Yuklashda xatolik'

  throw new Error(message)
}

export const uploadAppGuide = ({ url, method = 'POST', formData, onProgress }) =>
  new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open(method, url)

    const token = localStorage.getItem('zaxira_access_token')
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    }

    const deviceHeaders = getDeviceHeaders()
    Object.entries(deviceHeaders).forEach(([key, value]) => {
      xhr.setRequestHeader(key, value)
    })

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !onProgress) return
      onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
    }

    xhr.onload = () => {
      try {
        resolve(parseUploadResponse(xhr))
      } catch (error) {
        reject(error)
      }
    }

    xhr.onerror = () => reject(new Error('Tarmoq xatosi'))
    xhr.onabort = () => reject(new Error('Yuklash bekor qilindi'))

    xhr.send(formData)
  })

export const buildGuideFormData = (form, { isEdit = false } = {}) => {
  const formData = new FormData()
  formData.append('title', form.title.trim())
  formData.append('description', form.description.trim())
  formData.append('externalLink', form.externalLink.trim())
  formData.append('sortOrder', form.sortOrder || '0')

  if (isEdit) {
    formData.append('isActive', String(form.isActive))
  }

  if (form.video) {
    formData.append('video', form.video)
  }

  return formData
}

export const getGuideUploadUrl = (guideId) =>
  guideId
    ? `${env.apiBaseUrl}/app-usage/guides/${guideId}`
    : `${env.apiBaseUrl}/app-usage/guides`
