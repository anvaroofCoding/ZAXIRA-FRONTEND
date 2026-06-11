import { purchaseRequestsApi } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { warehouseDispatchesApi } from '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import { API_TAGS } from '@/shared/constants/apiTags'
import {
  acquireRealtimeSocket,
  releaseRealtimeSocket,
} from '@/shared/realtime/realtimeSocket'

export const createPurchaseRequestSocket = (token, dispatch) => {
  const socket = acquireRealtimeSocket(token)

  if (!socket) {
    return {
      connected: false,
      removeAllListeners() {},
      disconnect() {},
    }
  }

  const onPurchaseRequestChanged = ({ requestId }) => {
    const tags = [{ type: API_TAGS.PURCHASE_REQUEST, id: requestId }, API_TAGS.PURCHASE_REQUEST]

    dispatch(purchaseRequestsApi.util.invalidateTags(tags))
    dispatch(warehouseDispatchesApi.util.invalidateTags([API_TAGS.WAREHOUSE_DISPATCH]))
  }

  socket.off('purchase-request:changed')
  socket.on('purchase-request:changed', onPurchaseRequestChanged)

  return {
    get connected() {
      return socket.connected
    },
    removeAllListeners() {
      socket.off('purchase-request:changed', onPurchaseRequestChanged)
    },
    disconnect() {
      releaseRealtimeSocket()
    },
  }
}
