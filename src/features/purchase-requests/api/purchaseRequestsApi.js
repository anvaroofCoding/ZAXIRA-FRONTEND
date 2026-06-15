import { selectAccessToken, selectAuthUser } from '@/features/auth/model/authSlice'
import { baseApi } from '@/shared/api/baseApi'
import { env } from '@/shared/config/env'
import { API_TAGS } from '@/shared/constants/apiTags'
import {
  createLocalActiveSession,
  deleteLocalActiveSession,
  isLocalActiveSessionId,
  isMongoObjectId,
  listLocalActiveSessions,
  listSessionsPendingServerSync,
  markActiveSessionPendingServerSync,
  markActiveSessionServerSynced,
  mergeServerSessionsWithLocalCache,
  persistActiveSessionLocally,
} from '@/features/purchase-requests/utils/activeSessionsStorage'

const isSessionsApiUnavailable = (error) => {
  if (!error) return false

  const status = error.status

  return (
    status === 'FETCH_ERROR' ||
    status === 'PARSING_ERROR' ||
    status === 'TIMEOUT_ERROR' ||
    status === 404 ||
    (typeof status === 'number' && status >= 500)
  )
}

const shouldQueueServerSync = (error) => isSessionsApiUnavailable(error)

const syncPendingSessionsToServer = async (userId, baseQuery) => {
  const pending = listSessionsPendingServerSync(userId)
  if (!pending.length) return

  await Promise.all(
    pending.map(async (session) => {
      const payload = sanitizeSessionPayload(session)
      const result = await postSessionPayload(baseQuery, session.id, payload)

      if (!result.error) {
        markActiveSessionServerSynced(userId, session.id)
      }
    }),
  )
}

const unwrapApiPayload = (payload) =>
  payload && typeof payload === 'object' && 'success' in payload ? payload.data : payload

const submitSessionWithFiles = async (
  sessionId,
  bildirgiFile,
  kelishuvFile,
  token,
  sessionPayload,
) => {
  const formData = new FormData()
  formData.append('bildirgi', bildirgiFile, bildirgiFile.name || 'bildirgi.docx')
  formData.append('kelishuv', kelishuvFile, kelishuvFile.name || 'kelishuv.docx')

  if (sessionPayload) {
    formData.append('payload', JSON.stringify(sanitizeSessionPayload(sessionPayload)))
  }

  const response = await fetch(
    `${env.apiBaseUrl}/purchase-requests/active-sessions/${sessionId}/submit`,
    {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    },
  )

  let payload = null
  try {
    payload = await response.json()
  } catch {
    payload = null
  }

  if (!response.ok) {
    const message = payload?.message ?? payload?.error ?? 'Arizani yuborib bo‘lmadi'
    return {
      error: {
        status: response.status,
        data: {
          message: Array.isArray(message) ? message[0] ?? 'Arizani yuborib bo‘lmadi' : message,
        },
      },
    }
  }

  return { data: unwrapApiPayload(payload) }
}

const resolveActiveSessionsUserId = (api) => selectAuthUser(api.getState())?.id ?? null

const sanitizeSessionPayload = (body, { minimal = false } = {}) => {
  const commissionMemberIds = (body.commissionMemberIds ?? []).filter(isMongoObjectId)
  const next = {
    title: body.title,
    commissionMemberIds,
    items: Array.isArray(body.items)
      ? body.items.map((item) => ({
          name: item.name ?? '',
          characteristics: item.characteristics ?? '',
          quantity: Number.parseInt(String(item.quantity), 10) || 1,
          unit: item.unit ?? '',
          manufacturingCountry: item.manufacturingCountry ?? '',
        }))
      : [],
    comment: body.comment ?? '',
  }

  if (body.bossId && isMongoObjectId(body.bossId)) {
    next.bossId = body.bossId
  }

  if (!minimal) {
    next.commissionAgreementText = body.commissionAgreementText ?? ''

    if (body.purchasePeriodType) {
      next.purchasePeriodType = body.purchasePeriodType
    }
    if (body.purchasePeriodYear) {
      next.purchasePeriodYear = Number(body.purchasePeriodYear)
    }
    if (body.purchasePeriodType === 'quarter' && body.purchasePeriodQuarter) {
      next.purchasePeriodQuarter = Number(body.purchasePeriodQuarter)
    }
    if (body.purchasePeriodType === 'month' && body.purchasePeriodMonth) {
      next.purchasePeriodMonth = Number(body.purchasePeriodMonth)
    }
  }

  return next
}

const postSessionPayload = async (baseQuery, sessionId, payload) =>
  baseQuery({
    url: `/purchase-requests/active-sessions/${sessionId}`,
    method: 'POST',
    body: payload,
  })

const buildInboxQueryParams = ({ page, limit, search, dateFrom, dateTo, inboxType, structureId }) => ({
  page,
  limit,
  ...(search?.trim() ? { search: search.trim() } : {}),
  ...(dateFrom ? { dateFrom } : {}),
  ...(dateTo ? { dateTo } : {}),
  ...(inboxType ? { inboxType } : {}),
  ...(structureId ? { structureId } : {}),
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
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo, structureId } = {}) => ({
        url: '/purchase-requests/purchasing/inbox',
        params: buildInboxQueryParams({ page, limit, search, dateFrom, dateTo, structureId }),
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
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo, inboxType = 'purchased' } = {}) => ({
        url: '/purchase-requests/purchased/inbox',
        params: buildInboxQueryParams({ page, limit, search, dateFrom, dateTo, inboxType }),
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
    markItemsUnavailable: builder.mutation({
      query: ({ id, itemIndexes, comment }) => ({
        url: `/purchase-requests/${id}/purchase/unavailable`,
        method: 'POST',
        body: { itemIndexes, comment },
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
    getPurchaseRequestSessions: builder.query({
      queryFn: async (_arg, api, _extraOptions, baseQuery) => {
        const userId = resolveActiveSessionsUserId(api)

        if (!userId) {
          return { data: { items: [], total: 0, limit: 10 } }
        }

        const result = await baseQuery('/purchase-requests/active-sessions')

        if (result.error) {
          if (isSessionsApiUnavailable(result.error)) {
            return { data: listLocalActiveSessions(userId) }
          }

          return { error: result.error }
        }

        await syncPendingSessionsToServer(userId, baseQuery)

        return {
          data: mergeServerSessionsWithLocalCache(
            result.data ?? { items: [], total: 0, limit: 10 },
            userId,
          ),
        }
      },
      providesTags: [API_TAGS.PURCHASE_REQUEST_SESSION],
    }),
    createPurchaseRequestSession: builder.mutation({
      queryFn: async (_arg, api, _extraOptions, baseQuery) => {
        const userId = resolveActiveSessionsUserId(api)

        if (!userId) {
          return {
            error: {
              status: 401,
              data: { message: 'Foydalanuvchi aniqlanmadi' },
            },
          }
        }

        const result = await baseQuery({
          url: '/purchase-requests/active-sessions',
          method: 'POST',
        })

        if (!result.error) {
          return { data: result.data }
        }

        if (isSessionsApiUnavailable(result.error)) {
          try {
            return { data: createLocalActiveSession(userId) }
          } catch (error) {
            return {
              error: {
                status: 400,
                data: { message: error.message },
              },
            }
          }
        }

        return { error: result.error }
      },
      invalidatesTags: [API_TAGS.PURCHASE_REQUEST_SESSION],
    }),
    savePurchaseRequestSession: builder.mutation({
      queryFn: async ({ id, syncServer = false, ...body }, api, _extraOptions, baseQuery) => {
        const userId = resolveActiveSessionsUserId(api)

        if (!userId) {
          return {
            error: {
              status: 401,
              data: { message: 'Foydalanuvchi aniqlanmadi' },
            },
          }
        }

        const payload = sanitizeSessionPayload(body)

        let localSnapshot
        try {
          localSnapshot = persistActiveSessionLocally(userId, id, payload)
        } catch (error) {
          return {
            error: {
              status: 404,
              data: { message: error.message },
            },
          }
        }

        if (isLocalActiveSessionId(id)) {
          return { data: localSnapshot }
        }

        const result = await postSessionPayload(baseQuery, id, payload)

        if (!result.error) {
          markActiveSessionServerSynced(userId, id)
          return { data: { ...result.data, serverSaved: true, pendingServerSync: false } }
        }

        if (syncServer) {
          return { error: result.error }
        }

        if (shouldQueueServerSync(result.error)) {
          markActiveSessionPendingServerSync(userId, id)
          return {
            data: {
              ...localSnapshot,
              serverSaved: false,
              pendingServerSync: true,
            },
          }
        }

        return {
          data: {
            ...localSnapshot,
            serverSaved: false,
            pendingServerSync: false,
            serverErrorStatus: result.error?.status ?? null,
          },
        }
      },
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          if (!data?.id) return

          dispatch(
            purchaseRequestsApi.util.updateQueryData(
              'getPurchaseRequestSessions',
              undefined,
              (draft) => {
                if (!draft?.items) return

                const index = draft.items.findIndex((item) => item.id === id)
                if (index >= 0) {
                  draft.items[index] = { ...draft.items[index], ...data }
                  return
                }

                draft.items.unshift(data)
                draft.total = draft.items.length
              },
            ),
          )
        } catch {
          // queryFn allaqachon local cache ga yozadi
        }
      },
    }),
    preparePurchaseRequestDocuments: builder.mutation({
      query: ({ sessionId, sessionPayload }) => ({
        url: `/purchase-requests/active-sessions/${sessionId}/documents/prepare`,
        method: 'POST',
        body: sessionPayload ? sanitizeSessionPayload(sessionPayload) : {},
      }),
    }),
    uploadSessionDocument: builder.mutation({
      query: ({ sessionId, docType, file }) => {
        const formData = new FormData()
        formData.append('file', file)

        return {
          url: `/purchase-requests/active-sessions/${sessionId}/documents/${docType}/upload`,
          method: 'POST',
          body: formData,
        }
      },
    }),
    getOnlyOfficeConfig: builder.query({
      query: ({ sessionId, docType }) => ({
        url: `/purchase-requests/active-sessions/${sessionId}/onlyoffice/config`,
        params: { docType },
      }),
    }),
    submitPurchaseRequestSession: builder.mutation({
      queryFn: async (arg, api, _extraOptions, baseQuery) => {
        const sessionId = typeof arg === 'string' ? arg : arg?.sessionId
        const bildirgiFile = typeof arg === 'object' ? arg?.bildirgiFile : undefined
        const kelishuvFile = typeof arg === 'object' ? arg?.kelishuvFile : undefined
        const sessionPayload = typeof arg === 'object' ? arg?.sessionPayload : undefined

        if (!sessionId) {
          return {
            error: {
              status: 400,
              data: { message: 'Faol seans aniqlanmadi' },
            },
          }
        }

        if (isLocalActiveSessionId(sessionId)) {
          return {
            error: {
              status: 404,
              data: { message: 'Local session submit requires direct create' },
            },
          }
        }

        if (!bildirgiFile || !kelishuvFile) {
          return {
            error: {
              status: 400,
              data: {
                message: 'Bildirgi va kelishuv Word fayllari yuborilishi shart',
              },
            },
          }
        }

        const token = selectAccessToken(api.getState())
        const result = await submitSessionWithFiles(
          sessionId,
          bildirgiFile,
          kelishuvFile,
          token,
          sessionPayload,
        )

        if (!result.error) {
          const userId = resolveActiveSessionsUserId(api)
          if (userId) {
            deleteLocalActiveSession(userId, sessionId)
          }
          return { data: result.data }
        }

        return { error: result.error }
      },
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        const sessionId = typeof arg === 'string' ? arg : arg?.sessionId
        const patchResult = dispatch(
          purchaseRequestsApi.util.updateQueryData(
            'getPurchaseRequestSessions',
            undefined,
            (draft) => {
              if (!draft?.items) return

              draft.items = draft.items.filter((item) => item.id !== sessionId)
              draft.total = draft.items.length
            },
          ),
        )

        try {
          const { data } = await queryFulfilled

          if (data?.id) {
            dispatch(
              purchaseRequestsApi.util.upsertQueryData(
                'getPurchaseRequestById',
                data.id,
                data,
              ),
            )
          }
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (result) => [
        API_TAGS.PURCHASE_REQUEST,
        API_TAGS.PURCHASE_REQUEST_SESSION,
        ...(result?.id ? [{ type: API_TAGS.PURCHASE_REQUEST, id: result.id }] : []),
      ],
    }),
    deletePurchaseRequestSession: builder.mutation({
      queryFn: async (id, api, _extraOptions, baseQuery) => {
        const userId = resolveActiveSessionsUserId(api)

        if (isLocalActiveSessionId(id)) {
          return { data: deleteLocalActiveSession(userId, id) }
        }

        const result = await baseQuery({
          url: `/purchase-requests/active-sessions/${id}`,
          method: 'DELETE',
        })

        if (!result.error) {
          if (userId) {
            deleteLocalActiveSession(userId, id)
          }
          return { data: result.data }
        }

        if (isSessionsApiUnavailable(result.error)) {
          return { data: deleteLocalActiveSession(userId, id) }
        }

        return { error: result.error }
      },
      invalidatesTags: [API_TAGS.PURCHASE_REQUEST_SESSION],
    }),
    createPurchaseRequest: builder.mutation({
      query: (body) => ({
        url: '/purchase-requests',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.PURCHASE_REQUEST],
    }),
    polishPurchaseRequestItemText: builder.mutation({
      query: (body) => ({
        url: '/purchase-requests/ai/polish-item-text',
        method: 'POST',
        body,
      }),
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
  useGetPurchaseRequestSessionsQuery,
  useCreatePurchaseRequestSessionMutation,
  useSavePurchaseRequestSessionMutation,
  usePreparePurchaseRequestDocumentsMutation,
  useUploadSessionDocumentMutation,
  useGetOnlyOfficeConfigQuery,
  useSubmitPurchaseRequestSessionMutation,
  useDeletePurchaseRequestSessionMutation,
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
  useMarkItemsUnavailableMutation,
  useRejectPurchaseMutation,
  useDeletePurchaseRequestMutation,
  usePolishPurchaseRequestItemTextMutation,
} = purchaseRequestsApi
