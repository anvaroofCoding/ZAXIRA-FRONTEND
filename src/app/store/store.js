import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { baseApi } from '@/shared/api/baseApi'
import authReducer from '@/features/auth/model/authSlice'
import notificationReducer from '@/shared/model/notificationSlice'
import '@/features/auth/api/authApi'
import '@/features/users/api/usersApi'
import '@/features/structures/api/structuresApi'
import '@/features/purchase-requests/api/purchaseRequestsApi'
import '@/features/product-import/api/productImportApi'
import '@/features/warehouse-dispatches/api/warehouseDispatchesApi'
import '@/features/transfer/api/transferApi'
import '@/features/chat/api/chatApi'
import '@/features/invertarizatsiya/api/stocktakesApi'
import '@/features/product-prices/api/productPricesApi'
import '@/features/products/api/productsApi'
import '@/features/notifications/api/notificationsApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notification: notificationReducer,
    [baseApi.reducerPath]: baseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['api/executeQuery/pending'],
      },
    }).concat(baseApi.middleware),
  devTools: import.meta.env.DEV,
})

setupListeners(store.dispatch)
