import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const appUsageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAppAbout: builder.query({
      query: () => '/app-usage/about',
      providesTags: [API_TAGS.APP_USAGE_ABOUT],
      refetchOnMountOrArgChange: true,
    }),
    updateAppAbout: builder.mutation({
      query: (body) => ({
        url: '/app-usage/about',
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.APP_USAGE_ABOUT],
    }),
    getAppGuides: builder.query({
      query: () => '/app-usage/guides',
      refetchOnMountOrArgChange: true,
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((item) => ({ type: API_TAGS.APP_GUIDE, id: item.id })),
              API_TAGS.APP_GUIDE,
            ]
          : [API_TAGS.APP_GUIDE],
    }),
    getAppFaqs: builder.query({
      query: () => '/app-usage/faqs',
      refetchOnMountOrArgChange: true,
      providesTags: (result) =>
        result?.length
          ? [
              ...result.map((item) => ({ type: API_TAGS.APP_FAQ, id: item.id })),
              API_TAGS.APP_FAQ,
            ]
          : [API_TAGS.APP_FAQ],
    }),
    createAppFaq: builder.mutation({
      query: (body) => ({
        url: '/app-usage/faqs',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.APP_FAQ],
    }),
    deleteAppFaq: builder.mutation({
      query: (id) => ({
        url: `/app-usage/faqs/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.APP_FAQ],
    }),
    getAppGuidesAdmin: builder.query({
      query: () => '/app-usage/guides/admin',
      providesTags: [API_TAGS.APP_GUIDE],
    }),
    createAppGuide: builder.mutation({
      query: (formData) => ({
        url: '/app-usage/guides',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [API_TAGS.APP_GUIDE],
    }),
    updateAppGuide: builder.mutation({
      query: ({ id, formData }) => ({
        url: `/app-usage/guides/${id}`,
        method: 'PATCH',
        body: formData,
      }),
      invalidatesTags: [API_TAGS.APP_GUIDE],
    }),
    deleteAppGuide: builder.mutation({
      query: (id) => ({
        url: `/app-usage/guides/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.APP_GUIDE],
    }),
    markAppGuideWatched: builder.mutation({
      query: (id) => ({
        url: `/app-usage/guides/${id}/watched`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, id) => [
        { type: API_TAGS.APP_GUIDE, id },
        API_TAGS.APP_GUIDE,
      ],
    }),
  }),
})

export const {
  useGetAppAboutQuery,
  useUpdateAppAboutMutation,
  useGetAppGuidesQuery,
  useGetAppFaqsQuery,
  useCreateAppFaqMutation,
  useDeleteAppFaqMutation,
  useGetAppGuidesAdminQuery,
  useCreateAppGuideMutation,
  useUpdateAppGuideMutation,
  useDeleteAppGuideMutation,
  useMarkAppGuideWatchedMutation,
} = appUsageApi
