import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const stocktakesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActiveStocktake: builder.query({
      query: () => '/stocktakes/active',
      providesTags: [{ type: API_TAGS.STOCKTAKE, id: 'ACTIVE' }],
    }),
    getStocktakes: builder.query({
      query: ({ page = 1, limit = 10, status, structureId } = {}) => ({
        url: '/stocktakes',
        params: {
          page,
          limit,
          ...(status ? { status } : {}),
          ...(structureId ? { structureId } : {}),
        },
      }),
      providesTags: (result) =>
        result?.items?.length
          ? [
              ...result.items.map((item) => ({ type: API_TAGS.STOCKTAKE, id: item.id })),
              API_TAGS.STOCKTAKE,
            ]
          : [API_TAGS.STOCKTAKE],
    }),
    getStocktakeById: builder.query({
      query: (id) => `/stocktakes/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.STOCKTAKE, id }],
    }),
    searchStocktakeLines: builder.query({
      query: ({ id, q }) => ({
        url: `/stocktakes/${id}/search`,
        params: { q },
      }),
    }),
    createStocktake: builder.mutation({
      query: (body) => ({
        url: '/stocktakes',
        method: 'POST',
        body,
      }),
      invalidatesTags: [
        { type: API_TAGS.STOCKTAKE, id: 'ACTIVE' },
        API_TAGS.STOCKTAKE,
      ],
    }),
    updateStocktakeLine: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/stocktakes/${id}/lines`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: API_TAGS.STOCKTAKE, id: arg.id },
        { type: API_TAGS.STOCKTAKE, id: 'ACTIVE' },
      ],
    }),
    scanStocktakeBarcode: builder.mutation({
      query: ({ id, barcode }) => ({
        url: `/stocktakes/${id}/scan`,
        method: 'POST',
        body: { barcode },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: API_TAGS.STOCKTAKE, id: arg.id },
        { type: API_TAGS.STOCKTAKE, id: 'ACTIVE' },
      ],
    }),
    completeStocktake: builder.mutation({
      query: (id) => ({
        url: `/stocktakes/${id}/complete`,
        method: 'POST',
      }),
      invalidatesTags: [
        API_TAGS.STOCKTAKE,
        { type: API_TAGS.STOCKTAKE, id: 'ACTIVE' },
        API_TAGS.WAREHOUSE_INVENTORY,
      ],
    }),
    cancelStocktake: builder.mutation({
      query: (id) => ({
        url: `/stocktakes/${id}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: [
        API_TAGS.STOCKTAKE,
        { type: API_TAGS.STOCKTAKE, id: 'ACTIVE' },
      ],
    }),
    getStocktakesForManagement: builder.query({
      query: ({ page = 1, limit = 10 } = {}) => ({
        url: '/stocktakes/management',
        params: { page, limit },
      }),
      providesTags: [API_TAGS.STOCKTAKE],
    }),
    getStocktakeManagementDetail: builder.query({
      query: (id) => `/stocktakes/${id}/management`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.STOCKTAKE, id: `mgmt-${id}` }],
    }),
    applyExcessAdjustments: builder.mutation({
      query: ({ id, items }) => ({
        url: `/stocktakes/${id}/excess-adjustments`,
        method: 'POST',
        body: { items },
      }),
      invalidatesTags: (_result, _error, arg) => [
        API_TAGS.STOCKTAKE,
        { type: API_TAGS.STOCKTAKE, id: `mgmt-${arg.id}` },
        API_TAGS.WAREHOUSE_INVENTORY,
      ],
    }),
  }),
})

export const {
  useGetActiveStocktakeQuery,
  useGetStocktakesQuery,
  useGetStocktakeByIdQuery,
  useLazyGetStocktakeByIdQuery,
  useLazySearchStocktakeLinesQuery,
  useCreateStocktakeMutation,
  useUpdateStocktakeLineMutation,
  useScanStocktakeBarcodeMutation,
  useCompleteStocktakeMutation,
  useCancelStocktakeMutation,
  useGetStocktakesForManagementQuery,
  useGetStocktakeManagementDetailQuery,
  useApplyExcessAdjustmentsMutation,
} = stocktakesApi
