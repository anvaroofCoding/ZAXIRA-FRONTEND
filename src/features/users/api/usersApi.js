import { baseApi } from '@/shared/api/baseApi'
import { API_TAGS } from '@/shared/constants/apiTags'

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getPermissionCatalog: builder.query({
      query: () => '/users/permission-catalog',
    }),
    getUsersLookup: builder.query({
      query: () => ({
        url: '/users',
        params: { forSelect: '1' },
      }),
      providesTags: [API_TAGS.USER],
    }),
    getUsers: builder.query({
      query: ({ page = 1, limit = 10, search = '', structureId = '' } = {}) => ({
        url: '/users',
        params: {
          page,
          limit,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(structureId ? { structureId } : {}),
        },
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((user) => ({ type: API_TAGS.USER, id: user.id })),
              API_TAGS.USER,
            ]
          : [API_TAGS.USER],
    }),
    getUserById: builder.query({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: API_TAGS.USER, id }],
    }),
    createUser: builder.mutation({
      query: (body) => ({
        url: '/users',
        method: 'POST',
        body,
      }),
      invalidatesTags: [API_TAGS.USER],
    }),
    updateUser: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/users/${id}`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: [API_TAGS.USER],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.USER],
    }),
    permanentDeleteUser: builder.mutation({
      query: (id) => ({
        url: `/users/${id}/permanent`,
        method: 'DELETE',
      }),
      invalidatesTags: [API_TAGS.USER],
    }),
  }),
})

export const {
  useGetPermissionCatalogQuery,
  useGetUsersLookupQuery,
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  usePermanentDeleteUserMutation,
} = usersApi
