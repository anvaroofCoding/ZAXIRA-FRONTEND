import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const commissionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCommissionsPaged: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/commissions',
        params: {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((item) => ({
                type: API_TAGS.COMMISSION,
                id: item.id,
              })),
              API_TAGS.COMMISSION,
            ]
          : [API_TAGS.COMMISSION],
    }),
    getCommissionById: builder.query({
      query: (id) => `/commissions/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.COMMISSION, id }],
    }),
    createCommission: builder.mutation({
      query: (body) => ({
        url: '/commissions',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.COMMISSION],
    }),
    updateCommission: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/commissions/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.COMMISSION],
    }),
    deleteCommission: builder.mutation({
      query: (id) => ({
        url: `/commissions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.COMMISSION],
    }),
  }),
})

export const {
  useGetCommissionsPagedQuery,
  useGetCommissionByIdQuery,
  useCreateCommissionMutation,
  useUpdateCommissionMutation,
  useDeleteCommissionMutation,
} = commissionsApi
