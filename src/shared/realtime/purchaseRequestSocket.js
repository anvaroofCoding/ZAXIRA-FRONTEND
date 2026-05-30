import { io } from 'socket.io-client'
import { purchaseRequestsApi } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import { warehouseDispatchesApi } from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { env } from '@/shared/config/env'
import { API_TAGS } from '@/shared/constants/apiTags'

const resolveRealtimeUrl = () => {
  if (env.wsUrl) {
    return env.wsUrl
  }

  return env.apiBaseUrl.replace(/\/api\/?$/, '')
}

export const createPurchaseRequestSocket = (token, dispatch) => {
  const socket = io(`${resolveRealtimeUrl()}/realtime`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  socket.on('purchase-request:changed', ({ requestId }) => {
    const tags = [{ type: API_TAGS.PURCHASE_REQUEST, id: requestId }, API_TAGS.PURCHASE_REQUEST]

    dispatch(purchaseRequestsApi.util.invalidateTags(tags))
    dispatch(warehouseDispatchesApi.util.invalidateTags([API_TAGS.WAREHOUSE_DISPATCH]))
  })

  socket.on('notification:created', () => {
    dispatch(notificationsApi.util.invalidateTags([API_TAGS.NOTIFICATION]))
  })

  return socket
}
