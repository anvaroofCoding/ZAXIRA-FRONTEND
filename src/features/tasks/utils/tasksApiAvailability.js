import { useEffect, useState } from 'react'
import { env } from '@/shared/config/env'
import { getDeviceHeaders } from '@/shared/utils/deviceIdentity'

const listeners = new Set()

let unavailable = false
let probePromise = null

// Eski sessionStorage bayrog'ini tozalash (avvalgi versiyadan)
sessionStorage.removeItem('zaxira_tasks_api_unavailable')

const notifyListeners = () => {
  listeners.forEach((listener) => listener(unavailable))
}

export const getTasksApiErrorText = (error) => {
  const message = error?.data?.message

  if (Array.isArray(message)) {
    return message.filter(Boolean).join(' ')
  }

  if (typeof message === 'string') {
    return message
  }

  if (typeof error?.data === 'string') {
    return error.data
  }

  return ''
}

export const isTasksModuleMissingError = (error) => {
  if (error?.status !== 404) {
    return false
  }

  const text = getTasksApiErrorText(error)
  const path = typeof error?.data?.path === 'string' ? error.data.path : ''

  return text.includes('/tasks') || path.includes('/tasks')
}

export const isTasksApiUnavailable = () => unavailable

export const markTasksApiUnavailable = () => {
  if (unavailable) {
    return
  }

  unavailable = true
  notifyListeners()
}

export const resetTasksApiAvailability = () => {
  if (!unavailable) {
    return
  }

  unavailable = false
  notifyListeners()
}

export const probeTasksApiAvailability = async () => {
  if (probePromise) {
    return probePromise
  }

  probePromise = (async () => {
    const token = localStorage.getItem('zaxira_access_token')

    try {
      const response = await fetch(`${env.apiBaseUrl}/tasks/assigned?page=1&limit=1`, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          ...getDeviceHeaders(),
        },
      })

      if (response.status === 404) {
        markTasksApiUnavailable()
        return false
      }

      resetTasksApiAvailability()
      return true
    } catch {
      return !unavailable
    } finally {
      probePromise = null
    }
  })()

  return probePromise
}

export const subscribeTasksApiAvailability = (listener) => {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export const useIsTasksApiUnavailable = () => {
  const [isUnavailable, setIsUnavailable] = useState(() => isTasksApiUnavailable())

  useEffect(() => subscribeTasksApiAvailability(setIsUnavailable), [])

  return isUnavailable
}

export const useTasksApiAvailabilityProbe = () => {
  const unavailable = useIsTasksApiUnavailable()
  const [probing, setProbing] = useState(true)

  useEffect(() => {
    let cancelled = false

    probeTasksApiAvailability().finally(() => {
      if (!cancelled) {
        setProbing(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  return {
    unavailable,
    probing,
  }
}
