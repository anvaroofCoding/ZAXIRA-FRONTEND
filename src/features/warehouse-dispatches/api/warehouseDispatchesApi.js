import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const warehouseDispatchesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouseReceiptInbox: builder.query({
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo } = {}) => ({
        url: '/warehouse-dispatches/receipt/inbox',
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        },
      }),
      providesTags: [API_TAGS.WAREHOUSE_DISPATCH],
    }),
    getWarehouseReceiptPendingCount: builder.query({
      query: () => '/warehouse-dispatches/receipt/pending-count',
      providesTags: [API_TAGS.WAREHOUSE_DISPATCH],
    }),
    getWarehouseDispatchById: builder.query({
      query: ({ id, markSeen }) => ({
        url: `/warehouse-dispatches/${id}`,
        params: markSeen ? { markSeen: '1' } : undefined,
      }),
      providesTags: (_result, _error, { id }) => [
        { type: API_TAGS.WAREHOUSE_DISPATCH, id },
      ],
    }),
    createWarehouseDispatch: builder.mutation({
      query: (body) => ({
        url: '/warehouse-dispatches',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.WAREHOUSE_DISPATCH, API_TAGS.PURCHASE_REQUEST],
    }),
    receiveWarehouseDispatch: builder.mutation({
      query: ({ id, body }) => ({
        url: `/warehouse-dispatches/${id}/receive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.WAREHOUSE_DISPATCH, id },
        API_TAGS.WAREHOUSE_DISPATCH,
        API_TAGS.WAREHOUSE_INVENTORY,
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
  }),
})

export const {
  useGetWarehouseReceiptInboxQuery,
  useLazyGetWarehouseReceiptInboxQuery,
  useGetWarehouseReceiptPendingCountQuery,
  useGetWarehouseDispatchByIdQuery,
  useCreateWarehouseDispatchMutation,
  useReceiveWarehouseDispatchMutation,
} = warehouseDispatchesApi
