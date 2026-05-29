import { useEffect } from 'react'
import { selectAccessToken } from '@/features/auth/model/authSlice'
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

    return () => {
      socket.removeAllListeners()
      socket.disconnect()
    }
  }, [dispatch, token])
}
