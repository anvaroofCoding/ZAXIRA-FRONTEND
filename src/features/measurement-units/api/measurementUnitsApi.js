import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const measurementUnitsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getMeasurementUnitOptions: builder.query({
      query: () => '/measurement-units/options',
      providesTags: [API_TAGS.MEASUREMENT_UNIT],
    }),
    getCustomMeasurementUnitsPaged: builder.query({
      query: ({ page = 1, limit = 10, search = '' } = {}) => ({
        url: '/measurement-units/custom',
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
                type: API_TAGS.MEASUREMENT_UNIT,
                id: item.id,
              })),
              API_TAGS.MEASUREMENT_UNIT,
            ]
          : [API_TAGS.MEASUREMENT_UNIT],
    }),
    createCustomMeasurementUnit: builder.mutation({
      query: (body) => ({
        url: '/measurement-units/custom',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.MEASUREMENT_UNIT],
    }),
    updateCustomMeasurementUnit: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/measurement-units/custom/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.MEASUREMENT_UNIT],
    }),
    deleteCustomMeasurementUnit: builder.mutation({
      query: (id) => ({
        url: `/measurement-units/custom/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.MEASUREMENT_UNIT],
    }),
  }),
})

export const {
  useGetMeasurementUnitOptionsQuery,
  useGetCustomMeasurementUnitsPagedQuery,
  useCreateCustomMeasurementUnitMutation,
  useUpdateCustomMeasurementUnitMutation,
  useDeleteCustomMeasurementUnitMutation,
} = measurementUnitsApi
