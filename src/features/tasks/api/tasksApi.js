import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'
import { useIsTasksApiUnavailable } from '@/features/tasks/utils/tasksApiAvailability'

const tasksQueryDefaults = {
  refetchOnFocus: false,
  refetchOnReconnect: false,
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getStructureUsersForAssignment: builder.query({
      query: (structureId) => ({
        url: '/tasks/structure-users',
        params: { structureId },
      }),
      ...tasksQueryDefaults,
    }),
    getAssignedTasks: builder.query({
      query: ({ page = 1, limit = 10, search = '', structureId = '', status = '' } = {}) => ({
        url: '/tasks/assigned',
        params: {
          page,
          limit,
          ...(search?.trim() ? { search: search.trim() } : {}),
          ...(structureId ? { structureId } : {}),
          ...(status ? { status } : {}),
        },
      }),
      providesTags: [API_TAGS.TASK],
      ...tasksQueryDefaults,
    }),
    getMyPendingTasks: builder.query({
      query: () => '/tasks/my/pending',
      providesTags: [API_TAGS.TASK, { type: API_TAGS.TASK, id: 'MY_PENDING' }],
      ...tasksQueryDefaults,
    }),
    createAssignedTasks: builder.mutation({
      query: (formData) => ({
        url: '/tasks',
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: [API_TAGS.TASK, API_TAGS.DASHBOARD],
    }),
    completeAssignedTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}/complete`,
        method: 'PATCH',
      }),
      invalidatesTags: [API_TAGS.TASK, API_TAGS.DASHBOARD],
    }),
    cancelAssignedTask: builder.mutation({
      query: (id) => ({
        url: `/tasks/${id}/cancel`,
        method: 'PATCH',
      }),
      invalidatesTags: [API_TAGS.TASK, API_TAGS.DASHBOARD],
    }),
  }),
})

const {
  useGetStructureUsersForAssignmentQuery: useGetStructureUsersForAssignmentQueryBase,
  useGetAssignedTasksQuery: useGetAssignedTasksQueryBase,
  useGetMyPendingTasksQuery: useGetMyPendingTasksQueryBase,
  useCreateAssignedTasksMutation,
  useCompleteAssignedTaskMutation,
  useCancelAssignedTaskMutation,
} = tasksApi

export const useGetStructureUsersForAssignmentQuery = (structureId, options = {}) => {
  const tasksApiUnavailable = useIsTasksApiUnavailable()

  return useGetStructureUsersForAssignmentQueryBase(structureId, {
    ...options,
    skip: tasksApiUnavailable || options.skip,
  })
}

export const useGetAssignedTasksQuery = (queryArg, options = {}) => {
  const tasksApiUnavailable = useIsTasksApiUnavailable()

  return useGetAssignedTasksQueryBase(queryArg, {
    ...options,
    skip: tasksApiUnavailable || options.skip,
  })
}

export const useGetMyPendingTasksQuery = (queryArg, options = {}) => {
  const tasksApiUnavailable = useIsTasksApiUnavailable()

  return useGetMyPendingTasksQueryBase(queryArg, {
    ...options,
    skip: tasksApiUnavailable || options.skip,
    pollingInterval: tasksApiUnavailable ? 0 : options.pollingInterval,
  })
}

export {
  useCreateAssignedTasksMutation,
  useCompleteAssignedTaskMutation,
  useCancelAssignedTaskMutation,
}
