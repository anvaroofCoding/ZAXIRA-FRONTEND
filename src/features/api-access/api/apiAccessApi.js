import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const apiAccessApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApiCatalog: builder.query({
      query: () => '/api-access/catalog',
      providesTags: [API_TAGS.API_ACCESS],
    }),
    getApiAccessGrants: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/api-access/grants',
        params: {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
        },
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((item) => ({
                type: API_TAGS.API_ACCESS,
                id: item.id,
              })),
              API_TAGS.API_ACCESS,
            ]
          : [API_TAGS.API_ACCESS],
    }),
    getApiAccessGrantById: builder.query({
      query: (id) => `/api-access/grants/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.API_ACCESS, id }],
    }),
    createApiAccessGrant: builder.mutation({
      query: (body) => ({
        url: '/api-access/grants',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.API_ACCESS],
    }),
    revokeApiAccessGrant: builder.mutation({
      query: (id) => ({
        url: `/api-access/grants/${id}/revoke`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.API_ACCESS],
    }),
  }),
})

export const {
  useGetApiCatalogQuery,
  useGetApiAccessGrantsQuery,
  useGetApiAccessGrantByIdQuery,
  useCreateApiAccessGrantMutation,
  useRevokeApiAccessGrantMutation,
} = apiAccessApi
