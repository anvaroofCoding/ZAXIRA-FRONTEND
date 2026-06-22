import { useEffect } from 'react'
import { useGetCurrentUserQuery } from '@/features/auth/api/authApi'
import { useDeviceTelemetryReporter } from '@/features/auth/hooks/useDeviceTelemetryReporter'
import { selectAccessToken, setUser } from '@/features/auth/model/authSlice'
import { usePurchaseRequestRealtime } from '@/features/purchase-requests/hooks/usePurchaseRequestRealtime'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { useRealtimeToasts } from '@/shared/hooks/useRealtimeToasts'

export const AuthBootstrap = ({ children }) => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)

  usePurchaseRequestRealtime()
  useRealtimeToasts()
  useDeviceTelemetryReporter()
  const { data, isSuccess } = useGetCurrentUserQuery(undefined, {
    skip: !token,
  })

  useEffect(() => {
    if (isSuccess && data) {
      dispatch(setUser(data))
    }
  }, [isSuccess, data, dispatch])

  return children
}
