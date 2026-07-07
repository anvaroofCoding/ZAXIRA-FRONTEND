import { useEffect, useState } from 'react'
import { env } from '@/shared/config/env'
import { getDeviceHeaders } from '@/shared/utils/deviceIdentity'

export const useGuideVideoSource = (guideId, enabled = true) => {
  const [src, setSrc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled || !guideId) {
      setSrc('')
      setError('')
      return undefined
    }

    let active = true
    let objectUrl = ''

    const loadVideo = async () => {
      setLoading(true)
      setError('')

      try {
        const token = localStorage.getItem('zaxira_access_token')
        const response = await fetch(`${env.apiBaseUrl}/app-usage/guides/${guideId}/video`, {
          headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...getDeviceHeaders(),
          },
        })

        if (!response.ok) {
          throw new Error('Videoni yuklab bo‘lmadi')
        }

        const blob = await response.blob()
        if (!active) return

        objectUrl = window.URL.createObjectURL(blob)
        setSrc(objectUrl)
      } catch (e) {
        if (active) {
          setError(e?.message || 'Videoni yuklab bo‘lmadi')
          setSrc('')
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadVideo()

    return () => {
      active = false
      if (objectUrl) {
        window.URL.revokeObjectURL(objectUrl)
      }
    }
  }, [guideId, enabled])

  return { src, loading, error }
}
