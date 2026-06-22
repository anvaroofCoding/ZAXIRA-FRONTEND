import { useEffect } from 'react'
import { useReportDeviceTelemetryMutation } from '@/features/auth/api/authApi'
import { selectAccessToken } from '@/features/auth/model/authSlice'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { collectDeviceTelemetry } from '@/shared/utils/collectDeviceTelemetry'
import { getDeviceId, getDeviceName } from '@/shared/utils/deviceIdentity'

const REPORT_INTERVAL_MS = 60_000

export const useDeviceTelemetryReporter = () => {
  const token = useAppSelector(selectAccessToken)
  const [reportTelemetry] = useReportDeviceTelemetryMutation()

  useEffect(() => {
    if (!token) return undefined

    let cancelled = false

    const sendTelemetry = async () => {
      const telemetry = await collectDeviceTelemetry()
      if (!telemetry || cancelled) return

      try {
        await reportTelemetry({
          deviceId: getDeviceId(),
          deviceName: getDeviceName(),
          telemetry,
        }).unwrap()
      } catch {
        // Telemetriya yuborilmasa dastur ishlashda davom etadi
      }
    }

    sendTelemetry()
    const timerId = window.setInterval(sendTelemetry, REPORT_INTERVAL_MS)

    return () => {
      cancelled = true
      window.clearInterval(timerId)
    }
  }, [token, reportTelemetry])
}
