import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const warehouseApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWarehouseLocations: builder.query({
      query: () => '/warehouse/locations',
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((loc) => ({ type: API_TAGS.WAREHOUSE_LOCATION, id: loc.id })),
              API_TAGS.WAREHOUSE_LOCATION,
            ]
          : [API_TAGS.WAREHOUSE_LOCATION],
    }),
    createWarehouseLocation: builder.mutation({
      query: (body) => ({
        url: '/warehouse/locations',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.WAREHOUSE_LOCATION],
    }),
    updateWarehouseLocation: builder.mutation({
      query: ({ id, name }) => ({
        url: `/warehouse/locations/${id}`,
        method: 'PATCH',
        body: { name },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: API_TAGS.WAREHOUSE_LOCATION, id: arg.id },
        API_TAGS.WAREHOUSE_LOCATION,
      ],
    }),
    deleteWarehouseLocation: builder.mutation({
      query: (id) => ({
        url: `/warehouse/locations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: API_TAGS.WAREHOUSE_LOCATION, id },
        API_TAGS.WAREHOUSE_LOCATION,
        API_TAGS.WAREHOUSE_INVENTORY,
      ],
    }),
    getWarehouseInventoryByLocation: builder.query({
      query: ({ locationId, page = 1, limit = 10, search = '', minQuantity } = {}) => ({
        url: `/warehouse/locations/${locationId}/inventory`,
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(minQuantity != null ? { minQuantity } : {}),
        },
      }),
      providesTags: (result, _error, arg) => [
        { type: API_TAGS.WAREHOUSE_INVENTORY, id: arg.locationId },
        API_TAGS.WAREHOUSE_INVENTORY,
      ],
    }),
    getWarehouseInventoryItemHistory: builder.query({
      query: ({ locationId, inventoryId }) =>
        `/warehouse/locations/${locationId}/inventory/${inventoryId}/history`,
      providesTags: (_result, _error, { locationId, inventoryId }) => [
        API_TAGS.WAREHOUSE_INVENTORY,
        {
          type: API_TAGS.WAREHOUSE_INVENTORY,
          id: `history-${locationId}-${inventoryId}`,
        },
      ],
    }),
    updateWarehouseInventoryNomenclature: builder.mutation({
      query: ({ locationId, inventoryId, nomenclatureCode }) => ({
        url: `/warehouse/locations/${locationId}/inventory/${inventoryId}/nomenclature`,
        method: 'PATCH',
        body: { nomenclatureCode },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: API_TAGS.WAREHOUSE_INVENTORY, id: arg.locationId },
        API_TAGS.WAREHOUSE_INVENTORY,
      ],
    }),
    getAllWarehousesOverview: builder.query({
      query: () => '/warehouse/all/overview',
    }),
    getWarehouseStructureAnalytics: builder.query({
      query: (structureId) => `/warehouse/all/structures/${structureId}/analytics`,
    }),
    getWarehouseInventoryByAnyLocation: builder.query({
      query: ({ structureId, locationId, page = 1, limit = 10, search = '' }) => ({
        url: `/warehouse/all/locations/${locationId}/inventory`,
        params: {
          ...(structureId ? { structureId } : {}),
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      }),
    }),
    getWarehouseInventoryItemByBarcode: builder.query({
      query: ({ locationId, barcode }) => ({
        url: `/warehouse/locations/${locationId}/inventory/by-barcode`,
        params: { barcode },
      }),
    }),
    getWarehouseInventoryItemByBarcodeGlobally: builder.query({
      query: ({ barcode }) => ({
        url: '/warehouse/inventory/by-barcode',
        params: { barcode },
      }),
    }),
    getWarehouseExpenseReasons: builder.query({
      query: () => '/warehouse/expense-reasons',
    }),
    getWarehouseExpenses: builder.query({
      query: ({ page = 1, limit = 10, search = '', dateFrom, dateTo, reasonKey, structureId } = {}) => ({
        url: '/warehouse/expenses',
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(dateFrom ? { dateFrom } : {}),
          ...(dateTo ? { dateTo } : {}),
          ...(reasonKey ? { reasonKey } : {}),
          ...(structureId ? { structureId } : {}),
        },
      }),
      providesTags: [API_TAGS.WAREHOUSE_EXPENSE],
    }),
    getWarehouseExpenseByCode: builder.query({
      query: ({ code, structureId }) => ({
        url: `/warehouse/expenses/${encodeURIComponent(code)}`,
        ...(structureId ? { params: { structureId } } : {}),
      }),
      providesTags: (_result, _error, arg) => [
        { type: API_TAGS.WAREHOUSE_EXPENSE, id: `${arg?.structureId ?? ''}:${arg?.code ?? ''}` },
      ],
    }),
    createWarehouseExpense: builder.mutation({
      query: (body) => ({
        url: '/warehouse/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: (result, error, arg) => {
        const tags = [
          API_TAGS.WAREHOUSE_EXPENSE,
          API_TAGS.WAREHOUSE_INVENTORY,
          API_TAGS.WAREHOUSE_FIXED_ASSET,
        ]
        const locationId = arg?.items?.[0]?.locationId
        if (locationId) {
          tags.push({ type: API_TAGS.WAREHOUSE_INVENTORY, id: locationId })
        }
        return tags
      },
    }),
    deleteWarehouseExpense: builder.mutation({
      query: ({ code, structureId }) => ({
        url: `/warehouse/expenses/${encodeURIComponent(code)}`,
        method: 'DELETE',
        ...(structureId ? { params: { structureId } } : {}),
      }),
      invalidatesTags: [
        API_TAGS.WAREHOUSE_EXPENSE,
        API_TAGS.WAREHOUSE_INVENTORY,
        API_TAGS.WAREHOUSE_FIXED_ASSET,
      ],
    }),
    getWarehouseFixedAssets: builder.query({
      query: ({ page = 1, limit = 10, search = '', serviceStructureId, status = 'active' } = {}) => ({
        url: '/warehouse/fixed-assets',
        params: {
          page,
          limit,
          status,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(serviceStructureId ? { serviceStructureId } : {}),
        },
      }),
      providesTags: [API_TAGS.WAREHOUSE_FIXED_ASSET],
    }),
    returnWarehouseFixedAsset: builder.mutation({
      query: (id) => ({
        url: `/warehouse/fixed-assets/${id}/return`,
        method: 'POST',
      }),
      invalidatesTags: [API_TAGS.WAREHOUSE_FIXED_ASSET, API_TAGS.WAREHOUSE_INVENTORY],
    }),
    discardWarehouseFixedAsset: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/warehouse/fixed-assets/${id}/discard`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: [API_TAGS.WAREHOUSE_FIXED_ASSET],
    }),
  }),
})

export const {
  useGetWarehouseLocationsQuery,
  useCreateWarehouseLocationMutation,
  useUpdateWarehouseLocationMutation,
  useDeleteWarehouseLocationMutation,
  useGetWarehouseInventoryByLocationQuery,
  useLazyGetWarehouseInventoryByLocationQuery,
  useGetWarehouseInventoryItemHistoryQuery,
  useUpdateWarehouseInventoryNomenclatureMutation,
  useGetAllWarehousesOverviewQuery,
  useGetWarehouseStructureAnalyticsQuery,
  useGetWarehouseInventoryByAnyLocationQuery,
  useLazyGetWarehouseInventoryItemByBarcodeQuery,
  useLazyGetWarehouseInventoryItemByBarcodeGloballyQuery,
  useGetWarehouseExpenseReasonsQuery,
  useGetWarehouseExpensesQuery,
  useGetWarehouseExpenseByCodeQuery,
  useCreateWarehouseExpenseMutation,
  useDeleteWarehouseExpenseMutation,
  useGetWarehouseFixedAssetsQuery,
  useReturnWarehouseFixedAssetMutation,
  useDiscardWarehouseFixedAssetMutation,
} = warehouseApi

