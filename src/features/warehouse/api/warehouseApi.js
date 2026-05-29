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
    getWarehouseInventoryByLocation: builder.query({
      query: ({ locationId, page = 1, limit = 10, search = '' }) => ({
        url: `/warehouse/locations/${locationId}/inventory`,
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
        },
      }),
      providesTags: (result, _error, arg) => [
        { type: API_TAGS.WAREHOUSE_INVENTORY, id: arg.locationId },
        API_TAGS.WAREHOUSE_INVENTORY,
      ],
    }),
    getAllWarehousesOverview: builder.query({
      query: () => '/warehouse/all/overview',
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
    createWarehouseExpense: builder.mutation({
      query: (body) => ({
        url: '/warehouse/expenses',
        method: 'POST',
        body,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: API_TAGS.WAREHOUSE_INVENTORY, id: arg?.locationId },
        API_TAGS.WAREHOUSE_INVENTORY,
      ],
    }),
  }),
})

export const {
  useGetWarehouseLocationsQuery,
  useCreateWarehouseLocationMutation,
  useGetWarehouseInventoryByLocationQuery,
  useGetAllWarehousesOverviewQuery,
  useGetWarehouseInventoryByAnyLocationQuery,
  useLazyGetWarehouseInventoryItemByBarcodeQuery,
  useLazyGetWarehouseInventoryItemByBarcodeGloballyQuery,
  useGetWarehouseExpenseReasonsQuery,
  useCreateWarehouseExpenseMutation,
} = warehouseApi

