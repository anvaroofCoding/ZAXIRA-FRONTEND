import { useCallback, useState } from 'react'
import { useReportDeviceCompatibilityMutation } from '@/features/auth/api/authApi'
import { evaluateDeviceCompatibility } from '@/features/settings/utils/deviceCompatibility'
import { collectDeviceTelemetry } from '@/shared/utils/collectDeviceTelemetry'
import { getDeviceId, getDeviceName } from '@/shared/utils/deviceIdentity'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { showNotification } from '@/shared/model/notificationSlice'

export const useDeviceCompatibilityCheck = () => {
  const dispatch = useAppDispatch()
  const [reportCompatibility] = useReportDeviceCompatibilityMutation()
  const [status, setStatus] = useState('idle')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  const runCheck = useCallback(async () => {
    setStatus('loading')
    setError('')
    setResult(null)

    try {
      const telemetry = await collectDeviceTelemetry()

      if (!telemetry) {
        throw new Error('Qurilma ma’lumotlarini o‘qib bo‘lmadi')
      }

      const evaluation = evaluateDeviceCompatibility(telemetry)
      setResult(evaluation)

      const devicePayload = {
        deviceId: getDeviceId(),
        deviceName: getDeviceName(),
        telemetry,
      }

      await reportCompatibility({
        ...devicePayload,
        isCompatible: evaluation.isCompatible,
        overallStatus: evaluation.overallStatus,
        summary: evaluation.summary,
        checks: evaluation.checks,
      }).unwrap()

      const toastSeverity =
        evaluation.overallStatus === 'pass'
          ? 'success'
          : evaluation.overallStatus === 'partial'
            ? 'info'
            : 'warning'

      dispatch(
        showNotification({
          severity: toastSeverity,
          message: evaluation.summary,
        }),
      )

      setStatus('success')
    } catch (nextError) {
      const message =
        nextError?.data?.message ||
        nextError?.message ||
        'Qurilma mosligini tekshirib bo‘lmadi'

      setError(message)
      setStatus('error')

      dispatch(
        showNotification({
          severity: 'error',
          message,
        }),
      )
    }
  }, [dispatch, reportCompatibility])

  const reset = useCallback(() => {
    setStatus('idle')
    setResult(null)
    setError('')
  }, [])

  return {
    status,
    result,
    error,
    isChecking: status === 'loading',
    runCheck,
    reset,
  }
}
