import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

const buildListParams = ({ page, limit, search, dateFrom, dateTo, structureId }) => ({
  page,
  limit,
  ...(search?.trim() ? { search: search.trim() } : {}),
  ...(dateFrom ? { dateFrom } : {}),
  ...(dateTo ? { dateTo } : {}),
  ...(structureId ? { structureId } : {}),
})

export const transferApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTransferInbox: builder.query({
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo } = {}) => ({
        url: '/warehouse-dispatches/receipt/inbox',
        params: {
          ...buildListParams({ page, limit, search, dateFrom, dateTo }),
          source: 'transfer',
          scope: 'receipt',
        },
      }),
      providesTags: [API_TAGS.TRANSFER, API_TAGS.WAREHOUSE_DISPATCH],
    }),
    getTransferHistory: builder.query({
      query: ({
        page = 1,
        limit = 10,
        search = '',
        dateFrom,
        dateTo,
        structureId,
      } = {}) => ({
        url: '/warehouse-dispatches/receipt/inbox',
        params: {
          ...buildListParams({ page, limit, search, dateFrom, dateTo, structureId }),
          source: 'transfer',
          scope: 'history',
        },
      }),
      providesTags: [API_TAGS.TRANSFER, API_TAGS.WAREHOUSE_DISPATCH],
    }),
    getTransferCancelReasons: builder.query({
      query: () => '/warehouse-dispatches/cancel-reasons',
    }),
    getTransferById: builder.query({
      query: ({ id, markSeen }) => ({
        url: `/warehouse-dispatches/${id}`,
        params: {
          source: 'transfer',
          scope: 'history',
          ...(markSeen ? { markSeen: '1' } : {}),
        },
      }),
      providesTags: (_result, _error, { id }) => [
        { type: API_TAGS.TRANSFER, id },
        { type: API_TAGS.WAREHOUSE_DISPATCH, id },
      ],
    }),
    createTransfer: builder.mutation({
      query: (body) => ({
        url: '/warehouse-dispatches/transfer',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        API_TAGS.TRANSFER,
        API_TAGS.WAREHOUSE_DISPATCH,
        API_TAGS.WAREHOUSE_INVENTORY,
        API_TAGS.DASHBOARD,
      ],
    }),
    receiveTransfer: builder.mutation({
      query: ({ id, body }) => ({
        url: `/warehouse-dispatches/${id}/receive`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.TRANSFER, id },
        { type: API_TAGS.WAREHOUSE_DISPATCH, id },
        API_TAGS.TRANSFER,
        API_TAGS.WAREHOUSE_DISPATCH,
        API_TAGS.WAREHOUSE_INVENTORY,
        API_TAGS.DASHBOARD,
      ],
    }),
    cancelTransfer: builder.mutation({
      query: ({ id, body }) => ({
        url: `/warehouse-dispatches/${id}/cancel`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.TRANSFER, id },
        { type: API_TAGS.WAREHOUSE_DISPATCH, id },
        API_TAGS.TRANSFER,
        API_TAGS.WAREHOUSE_DISPATCH,
        API_TAGS.WAREHOUSE_INVENTORY,
        API_TAGS.DASHBOARD,
      ],
    }),
  }),
})

export const {
  useGetTransferInboxQuery,
  useGetTransferHistoryQuery,
  useGetTransferByIdQuery,
  useGetTransferCancelReasonsQuery,
  useCreateTransferMutation,
  useReceiveTransferMutation,
  useCancelTransferMutation,
} = transferApi
