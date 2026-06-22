import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({
        url: '/auth/login',
        method: 'POST',
        body,
      }),
    }),
    getCurrentUser: builder.query({
      query: () => '/auth/me',
      providesTags: [API_TAGS.USER],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({
        url: '/auth/me',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.USER],
    }),
    changePassword: builder.mutation({
      query: (body) => ({
        url: '/auth/me/password',
        method: 'PATCH',
        body,
      }),
    }),
    logout: builder.mutation({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    reportDeviceTelemetry: builder.mutation({
      query: (body) => ({
        url: '/auth/device-telemetry',
        method: 'POST',
        body,
      }),
    }),
    reportDeviceCompatibility: builder.mutation({
      query: (body) => ({
        url: '/auth/device-compatibility-check',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.NOTIFICATION],
    }),
    getGlobalSecondCodeStatus: builder.query({
      query: () => '/auth/global-second-code/status',
    }),
    setGlobalSecondCode: builder.mutation({
      query: (body) => ({
        url: '/auth/global-second-code',
        method: 'POST',
        body,
      }),
      invalidatesTags: [],
    }),
  }),
})

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useLogoutMutation,
  useReportDeviceTelemetryMutation,
  useReportDeviceCompatibilityMutation,
  useGetGlobalSecondCodeStatusQuery,
  useSetGlobalSecondCodeMutation,
} = authApi
