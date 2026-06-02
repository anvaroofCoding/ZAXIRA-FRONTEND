import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardSummary: builder.query({
      query: ({ structureId } = {}) => ({
        url: '/dashboard/summary',
        params: structureId ? { structureId } : {},
      }),
      providesTags: [API_TAGS.DASHBOARD],
    }),
    getDashboardMonthlyMax: builder.query({
      query: ({ structureId, months = 12 } = {}) => ({
        url: '/dashboard/analytics/monthly-max',
        params: {
          ...(structureId ? { structureId } : {}),
          months,
        },
      }),
      providesTags: [API_TAGS.DASHBOARD],
    }),
    getDashboardDailyMax: builder.query({
      query: ({ structureId, days = 30, offsetDays = 0 } = {}) => ({
        url: '/dashboard/analytics/daily-max',
        params: {
          ...(structureId ? { structureId } : {}),
          days,
          offsetDays,
        },
      }),
      providesTags: [API_TAGS.DASHBOARD],
    }),
    getDashboardCalendar: builder.query({
      query: ({ structureId, from, to } = {}) => ({
        url: '/dashboard/calendar',
        params: {
          ...(structureId ? { structureId } : {}),
          from,
          to,
        },
      }),
      providesTags: [API_TAGS.DASHBOARD],
    }),
  }),
})

export const {
  useGetDashboardSummaryQuery,
  useGetDashboardMonthlyMaxQuery,
  useGetDashboardDailyMaxQuery,
  useGetDashboardCalendarQuery,
} = dashboardApi

