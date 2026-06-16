import { selectAuthUser } from '@/features/auth/model/authSlice'
import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'
import {
  createLocalImportSession,
  deleteLocalImportSession,
  isLocalImportSessionId,
  isMongoObjectId,
  listImportSessionsPendingServerSync,
  listLocalImportSessions,
  markImportSessionPendingServerSync,
  markImportSessionServerSynced,
  mergeServerImportSessionsWithLocalCache,
  persistImportSessionLocally,
} from '@/features/product-import/utils/activeSessionsStorage'

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

const resolveActiveSessionsUserId = (api) => selectAuthUser(api.getState())?.id ?? null

const sanitizeSessionPayload = (body = {}) => ({
  title: body.title?.trim() || undefined,
  locationId: body.locationId?.trim() || undefined,
  comment: body.comment?.trim() ?? '',
  items: (body.items ?? []).map((item) => ({
    name: item.name?.trim() ?? '',
    characteristics: item.characteristics?.trim() ?? '',
    quantity: Number.parseInt(String(item.quantity ?? 1), 10) || 1,
    unit: item.unit?.trim() || 'dona',
    manufacturingCountry: item.manufacturingCountry?.trim() ?? '',
  })),
})

const postSessionPayload = (baseQuery, sessionId, payload) =>
  baseQuery({
    url: `/warehouse/imports/active-sessions/${sessionId}`,
    method: 'POST',
    body: payload,
  })

const syncPendingSessionsToServer = async (userId, baseQuery) => {
  const pending = listImportSessionsPendingServerSync(userId)
  if (!pending.length) return

  await Promise.all(
    pending.map(async (session) => {
      const payload = sanitizeSessionPayload(session)
      const result = await postSessionPayload(baseQuery, session.id, payload)

      if (!result.error) {
        markImportSessionServerSynced(userId, session.id)
      }
    }),
  )
}

export const productImportApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductImports: builder.query({
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo } = {}) => ({
        url: '/warehouse/imports',
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
        },
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((item) => ({
                type: API_TAGS.WAREHOUSE_IMPORT,
                id: item.id,
              })),
              API_TAGS.WAREHOUSE_IMPORT,
            ]
          : [API_TAGS.WAREHOUSE_IMPORT],
    }),
    getProductImportById: builder.query({
      query: (id) => `/warehouse/imports/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.WAREHOUSE_IMPORT, id }],
    }),
    getProductImportSessions: builder.query({
      queryFn: async (_arg, api, _extraOptions, baseQuery) => {
        const userId = resolveActiveSessionsUserId(api)

        if (!userId) {
          return { data: { items: [], total: 0, limit: 10 } }
        }

        const result = await baseQuery('/warehouse/imports/active-sessions')

        if (result.error) {
          if (isSessionsApiUnavailable(result.error)) {
            return { data: listLocalImportSessions(userId) }
          }

          return { error: result.error }
        }

        await syncPendingSessionsToServer(userId, baseQuery)

        return {
          data: mergeServerImportSessionsWithLocalCache(
            result.data ?? { items: [], total: 0, limit: 10 },
            userId,
          ),
        }
      },
      providesTags: [API_TAGS.WAREHOUSE_IMPORT_SESSION],
    }),
    createProductImportSession: builder.mutation({
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
          url: '/warehouse/imports/active-sessions',
          method: 'POST',
        })

        if (!result.error) {
          return { data: result.data }
        }

        if (isSessionsApiUnavailable(result.error)) {
          try {
            return { data: createLocalImportSession(userId) }
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
      invalidatesTags: [API_TAGS.WAREHOUSE_IMPORT_SESSION],
    }),
    saveProductImportSession: builder.mutation({
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
          localSnapshot = persistImportSessionLocally(userId, id, payload)
        } catch (error) {
          return {
            error: {
              status: 404,
              data: { message: error.message },
            },
          }
        }

        if (isLocalImportSessionId(id)) {
          return { data: localSnapshot }
        }

        const result = await postSessionPayload(baseQuery, id, payload)

        if (!result.error) {
          markImportSessionServerSynced(userId, id)
          return { data: { ...result.data, serverSaved: true, pendingServerSync: false } }
        }

        if (syncServer) {
          return { error: result.error }
        }

        if (shouldQueueServerSync(result.error)) {
          markImportSessionPendingServerSync(userId, id)
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
            productImportApi.util.updateQueryData(
              'getProductImportSessions',
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
    submitProductImportSession: builder.mutation({
      queryFn: async ({ sessionId, ...body }, api, _extraOptions, baseQuery) => {
        const userId = resolveActiveSessionsUserId(api)

        if (!userId || !sessionId) {
          return {
            error: {
              status: 400,
              data: { message: 'Seans aniqlanmadi' },
            },
          }
        }

        if (isLocalImportSessionId(sessionId)) {
          return {
            error: {
              status: 400,
              data: {
                message:
                  'Importni saqlash uchun internet ulanishi va server seansi kerak',
              },
            },
          }
        }

        const payload = sanitizeSessionPayload(body)
        const result = await baseQuery({
          url: `/warehouse/imports/active-sessions/${sessionId}/submit`,
          method: 'POST',
          body: payload,
        })

        if (result.error) {
          return { error: result.error }
        }

        deleteLocalImportSession(userId, sessionId)
        return { data: result.data }
      },
      invalidatesTags: [
        API_TAGS.WAREHOUSE_IMPORT_SESSION,
        API_TAGS.WAREHOUSE_INVENTORY,
        API_TAGS.WAREHOUSE_IMPORT,
      ],
    }),
    deleteProductImportSession: builder.mutation({
      queryFn: async (sessionId, api, _extraOptions, baseQuery) => {
        const userId = resolveActiveSessionsUserId(api)

        if (!userId) {
          return {
            error: {
              status: 401,
              data: { message: 'Foydalanuvchi aniqlanmadi' },
            },
          }
        }

        deleteLocalImportSession(userId, sessionId)

        if (isLocalImportSessionId(sessionId)) {
          return { data: { id: sessionId, deleted: true } }
        }

        const result = await baseQuery({
          url: `/warehouse/imports/active-sessions/${sessionId}`,
          method: 'DELETE',
        })

        if (result.error && !isSessionsApiUnavailable(result.error)) {
          return { error: result.error }
        }

        return { data: { id: sessionId, deleted: true } }
      },
      invalidatesTags: [API_TAGS.WAREHOUSE_IMPORT_SESSION],
    }),
  }),
})

export const {
  useGetProductImportsQuery,
  useGetProductImportByIdQuery,
  useGetProductImportSessionsQuery,
  useCreateProductImportSessionMutation,
  useSaveProductImportSessionMutation,
  useSubmitProductImportSessionMutation,
  useDeleteProductImportSessionMutation,
} = productImportApi
