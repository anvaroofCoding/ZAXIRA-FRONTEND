import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { selectAccessToken } from '@/features/auth/model/authSlice'
import { env } from '@/shared/config/env'
import { API_TAGS } from '@/shared/constants/apiTags'
import { PERMISSION_DENIED_MESSAGE } from '@/shared/constants/messages'
import { showNotification } from '@/shared/model/notificationSlice'
import { getDeviceHeaders } from '@/shared/utils/deviceIdentity'
import {
  getApiErrorText,
  handleSessionExpired,
  shouldHandleSessionExpired,
} from '@/shared/utils/sessionExpired'

const rawBaseQuery = fetchBaseQuery({
  baseUrl: env.apiBaseUrl,
  prepareHeaders: (headers, { getState }) => {
    const token = selectAccessToken(getState())

    if (token) {
      headers.set('Authorization', `Bearer ${token}`)
    }

    const deviceHeaders = getDeviceHeaders()
    headers.set('X-Device-Id', deviceHeaders['X-Device-Id'])
    headers.set('X-Device-Name', deviceHeaders['X-Device-Name'])

    return headers
  },
})

const baseQuery = async (args, api, extraOptions) => {
  const hadToken = Boolean(selectAccessToken(api.getState()))
  const result = await rawBaseQuery(args, api, extraOptions)

  if (shouldHandleSessionExpired(result.error, args, hadToken)) {
    handleSessionExpired(api.dispatch, getApiErrorText(result.error))
    return result
  }

  if (result.error?.status === 403) {
    api.dispatch(
      showNotification({
        message: PERMISSION_DENIED_MESSAGE,
        severity: 'warning',
      }),
    )
  }

  if (result.data && typeof result.data === 'object' && 'success' in result.data) {
    return {
      ...result,
      data: result.data.data,
    }
  }

  return result
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: Object.values(API_TAGS),
  endpoints: () => ({}),
  keepUnusedDataFor: 60,
  refetchOnMountOrArgChange: 30,
  refetchOnFocus: true,
  refetchOnReconnect: true,
})
