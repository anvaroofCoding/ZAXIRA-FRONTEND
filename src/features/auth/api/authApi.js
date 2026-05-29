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
  }),
})

export const {
  useLoginMutation,
  useGetCurrentUserQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
} = authApi
