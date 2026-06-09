import { useEffect } from 'react'
import { selectAccessToken } from '@/features/auth/model/authSlice'
import { setRealtimeConnected } from '@/shared/realtime/realtimeConnectionState'
import { createPurchaseRequestSocket } from '@/shared/realtime/purchaseRequestSocket'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'

export const usePurchaseRequestRealtime = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)

  useEffect(() => {
    if (!token) {
      return undefined
    }

    const socket = createPurchaseRequestSocket(token, dispatch)

    if (socket.connected) {
      setRealtimeConnected(true)
    }

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
      setRealtimeConnected(false)
    }
  }, [dispatch, token])
}
