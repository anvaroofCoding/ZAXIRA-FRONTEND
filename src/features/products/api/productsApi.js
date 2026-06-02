import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

const productsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProducts: builder.query({
      query: ({ search, page = 1, limit = 25 } = {}) => ({
        url: '/products',
        params: {
          ...(search ? { search } : {}),
          page,
          limit,
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((item) => ({
                type: API_TAGS.PRODUCT,
                id: item.itemKey,
              })),
              { type: API_TAGS.PRODUCT, id: 'LIST' },
            ]
          : [{ type: API_TAGS.PRODUCT, id: 'LIST' }],
    }),
    searchProducts: builder.query({
      query: ({ q = '', limit = 20 } = {}) => ({
        url: '/products/search',
        params: {
          ...(q ? { q } : {}),
          limit,
        },
      }),
    }),
    archiveProduct: builder.mutation({
      query: (itemKey) => ({
        url: `/products/${encodeURIComponent(itemKey)}/archive`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: API_TAGS.PRODUCT, id: 'LIST' }],
    }),
  }),
})

export const {
  useGetProductsQuery,
  useLazySearchProductsQuery,
  useArchiveProductMutation,
} = productsApi
