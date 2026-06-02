import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

const buildInboxQueryParams = ({ page, limit, search, dateFrom, dateTo }) => ({
  page,
  limit,
  ...(search?.trim() ? { search: search.trim() } : {}),
  ...(dateFrom ? { dateFrom } : {}),
  ...(dateTo ? { dateTo } : {}),
})

export const purchaseRequestsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPurchaseRequests: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/purchase-requests',
        params: {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      }),
      providesTags: (result) => {
        if (!result?.items?.length) {
          return [API_TAGS.PURCHASE_REQUEST]
        }

        const tags = result.items.map((item) => ({
          type: API_TAGS.PURCHASE_REQUEST,
          id: item.id,
        }))
        tags.push(API_TAGS.PURCHASE_REQUEST)
        return tags
      },
    }),
    getPurchaseRequestById: builder.query({
      query: (arg) => {
        const id = typeof arg === 'string' ? arg : arg?.id
        const purchasingView =
          typeof arg === 'object' && arg?.purchasingView ? '1' : undefined
        const historyView =
          typeof arg === 'object' && arg?.historyView ? '1' : undefined

        const params = {}
        if (purchasingView) params.purchasingView = purchasingView
        if (historyView) params.historyView = historyView

        return {
          url: `/purchase-requests/${id}`,
          params: Object.keys(params).length ? params : undefined,
        }
      },
      providesTags: (_result, _error, arg) => {
        const id = typeof arg === 'string' ? arg : arg?.id
        return [{ type: API_TAGS.PURCHASE_REQUEST, id }]
      },
    }),
    getPurchasingInbox: builder.query({
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo } = {}) => ({
        url: '/purchase-requests/purchasing/inbox',
        params: buildInboxQueryParams({ page, limit, search, dateFrom, dateTo }),
      }),
      providesTags: (result) => {
        if (!result?.items?.length) {
          return [API_TAGS.PURCHASE_REQUEST]
        }

        const tags = result.items.map((item) => ({
          type: API_TAGS.PURCHASE_REQUEST,
          id: item.id,
        }))
        tags.push(API_TAGS.PURCHASE_REQUEST)
        return tags
      },
    }),
    getPurchasedInbox: builder.query({
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo } = {}) => ({
        url: '/purchase-requests/purchased/inbox',
        params: buildInboxQueryParams({ page, limit, search, dateFrom, dateTo }),
      }),
      providesTags: (result) => {
        if (!result?.items?.length) {
          return [API_TAGS.PURCHASE_REQUEST]
        }

        const tags = result.items.map((item) => ({
          type: API_TAGS.PURCHASE_REQUEST,
          id: item.id,
        }))
        tags.push(API_TAGS.PURCHASE_REQUEST)
        return tags
      },
    }),
    rejectPurchase: builder.mutation({
      query: ({ id, reasonKey, comment }) => ({
        url: `/purchase-requests/${id}/purchase/reject`,
        method: 'POST',
        body: { reasonKey, comment },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.PURCHASE_REQUEST, id },
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
    completePurchase: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/purchase-requests/${id}/purchase`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.PURCHASE_REQUEST, id },
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
    updatePurchaseRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-requests/${id}/update`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.PURCHASE_REQUEST, id },
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
    createPurchaseRequest: builder.mutation({
      query: (body) => ({
        url: '/purchase-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.PURCHASE_REQUEST],
    }),
    getPurchaseRequestHistory: builder.query({
      query: ({ page = 1, limit = 25, search = '', status = '', eventType = '' } = {}) => ({
        url: '/purchase-requests/history',
        params: {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(status ? { status } : {}),
          ...(eventType ? { eventType } : {}),
        },
      }),
      providesTags: [API_TAGS.PURCHASE_REQUEST],
    }),
    getApprovalInbox: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/purchase-requests/approvals/inbox',
        params: {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      }),
      providesTags: (result) => {
        if (!result?.items?.length) {
          return [API_TAGS.PURCHASE_REQUEST]
        }

        const tags = result.items.map((item) => ({
          type: API_TAGS.PURCHASE_REQUEST,
          id: item.id,
        }))
        tags.push(API_TAGS.PURCHASE_REQUEST)
        return tags
      },
    }),
    submitApprovalDecision: builder.mutation({
      query: ({ id, decision, comment }) => ({
        url: `/purchase-requests/${id}/decisions`,
        method: 'POST',
        body: { decision, comment },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.PURCHASE_REQUEST, id },
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
    confirmBossDecision: builder.mutation({
      query: ({ id, decision, comment }) => ({
        url: `/purchase-requests/${id}/boss-confirm`,
        method: 'POST',
        body: { decision, comment },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.PURCHASE_REQUEST, id },
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
    resubmitPurchaseRequest: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/purchase-requests/${id}/resubmit`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: API_TAGS.PURCHASE_REQUEST, id },
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
    deletePurchaseRequest: builder.mutation({
      query: (id) => ({
        url: `/purchase-requests/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.PURCHASE_REQUEST, id },
        API_TAGS.PURCHASE_REQUEST,
      ],
    }),
  }),
})

export const {
  useGetPurchaseRequestsQuery,
  useGetPurchaseRequestByIdQuery,
  useCreatePurchaseRequestMutation,
  useUpdatePurchaseRequestMutation,
  useGetPurchaseRequestHistoryQuery,
  useGetApprovalInboxQuery,
  useSubmitApprovalDecisionMutation,
  useConfirmBossDecisionMutation,
  useResubmitPurchaseRequestMutation,
  useGetPurchasingInboxQuery,
  useGetPurchasedInboxQuery,
  useCompletePurchaseMutation,
  useRejectPurchaseMutation,
  useDeletePurchaseRequestMutation,
} = purchaseRequestsApi
