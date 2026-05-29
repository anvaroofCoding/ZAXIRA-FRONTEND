import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const structuresApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStructures: builder.query({
      query: () => '/structures',
      providesTags: [API_TAGS.STRUCTURE],
    }),
    getStructuresPaged: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/structures',
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
                type: API_TAGS.STRUCTURE,
                id: item.id,
              })),
              API_TAGS.STRUCTURE,
            ]
          : [API_TAGS.STRUCTURE],
    }),
    getStructureById: builder.query({
      query: (id) => `/structures/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.STRUCTURE, id }],
    }),
    createStructure: builder.mutation({
      query: (body) => ({
        url: '/structures',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.STRUCTURE],
    }),
    updateStructure: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/structures/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.STRUCTURE],
    }),
    deleteStructure: builder.mutation({
      query: (id) => ({
        url: `/structures/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.STRUCTURE],
    }),
  }),
})

export const {
  useGetStructuresQuery,
  useGetStructuresPagedQuery,
  useGetStructureByIdQuery,
  useCreateStructureMutation,
  useUpdateStructureMutation,
  useDeleteStructureMutation,
} = structuresApi
