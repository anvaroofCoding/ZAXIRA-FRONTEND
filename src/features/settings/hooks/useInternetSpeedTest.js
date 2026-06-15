import { useCallback, useEffect, useRef, useState } from 'react'
import { runInternetSpeedTest } from '@/features/settings/utils/internetSpeedTest'

export const useInternetSpeedTest = ({ autoRun = true } = {}) => {
  const [status, setStatus] = useState(autoRun ? 'measuring' : 'idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const abortRef = useRef(null)

  const runTest = useCallback(async () => {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStatus('measuring')
    setError('')
    setResult(null)

    try {
      const data = await runInternetSpeedTest({ signal: controller.signal })
      if (controller.signal.aborted) return
      setResult(data)
      setStatus('done')
    } catch (e) {
      if (e?.name === 'AbortError') return
      setError(e?.message || 'Internet tezligini aniqlab bo‘lmadi')
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    if (!autoRun) return undefined
    runTest()
    return () => abortRef.current?.abort()
  }, [autoRun, runTest])

  return {
    status,
    result,
    error,
    isMeasuring: status === 'measuring',
    runTest,
  }
}
