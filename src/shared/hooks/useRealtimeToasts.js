import { useEffect } from 'react'
import { authApi } from '@/features/auth/api/authApi'
import { selectAccessToken, selectAuthUser, setUser } from '@/features/auth/model/authSlice'
import { chatApi } from '@/features/chat/api/chatApi'
import { notificationsApi } from '@/features/notifications/api/notificationsApi'
import { API_TAGS } from '@/shared/constants/apiTags'
import { showNotification } from '@/shared/model/notificationSlice'
import { shouldSuppressChatToast } from '@/shared/realtime/chatUiState'
import { acquireChatSocket, releaseChatSocket } from '@/shared/realtime/chatSocket'
import { buildChatPreview } from '@/shared/utils/buildChatToastMessage'
import {
  getChatToastEnabled,
  getNotificationToastEnabled,
} from '@/shared/utils/userPreferences'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'

export const useRealtimeToasts = () => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectAuthUser)

  useEffect(() => {
    if (!token) return undefined

    const socket = acquireChatSocket(token)
    if (!socket) return undefined

    const onNotificationCreated = (payload) => {
      dispatch(notificationsApi.util.invalidateTags([API_TAGS.NOTIFICATION]))

      if (payload?.type === 'PERMISSIONS_GRANTED' || payload?.type === 'PERMISSIONS_UPDATED') {
        dispatch(
          authApi.endpoints.getCurrentUser.initiate(undefined, {
            subscribe: false,
            forceRefetch: true,
          }),
        )
          .then((result) => {
            if (result?.data) {
              dispatch(setUser(result.data))
            }
          })
          .catch(() => {})
      }

      if (!getNotificationToastEnabled()) return

      const title = payload?.title?.trim()
      const message = payload?.message?.trim()
      const toastMessage = [title, message].filter(Boolean).join(' — ') || 'Yangi bildirishnoma'

      const toastSeverity =
        payload?.type === 'DEVICE_COMPATIBILITY'
          ? payload?.entityId === 'pass' || payload?.title?.includes('mos keldi')
            ? 'success'
            : 'warning'
          : 'info'

      dispatch(
        showNotification({
          message: toastMessage,
          severity: toastSeverity,
        }),
      )
    }

    const onChatMessage = (payload) => {
      dispatch(chatApi.util.invalidateTags([API_TAGS.CHAT]))

      if (!getChatToastEnabled()) return
      if (!payload || payload.senderId === user?.id) return
      if (shouldSuppressChatToast(payload)) return

      dispatch(
        showNotification({
          message: buildChatPreview(payload),
          severity: 'info',
        }),
      )
    }

    socket.on('notification:created', onNotificationCreated)
    socket.on('chat:message', onChatMessage)

    return () => {
      socket.off('notification:created', onNotificationCreated)
      socket.off('chat:message', onChatMessage)
      releaseChatSocket()
    }
  }, [dispatch, token, user?.id])
}
