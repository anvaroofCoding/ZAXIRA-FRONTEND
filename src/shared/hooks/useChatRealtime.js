import { useEffect, useRef } from 'react'
import { chatApi } from '@/features/chat/api/chatApi'
import { selectAccessToken, selectAuthUser } from '@/features/auth/model/authSlice'
import { API_TAGS } from '@/shared/constants/apiTags'
import { useAppDispatch } from '@/shared/hooks/useAppDispatch'
import { useAppSelector } from '@/shared/hooks/useAppSelector'
import { acquireChatSocket, releaseChatSocket } from '@/shared/realtime/chatSocket'

export const useChatRealtime = ({
  enabled = true,
  activeRoom,
  onMessage,
  onTyping,
  onReaction,
}) => {
  const dispatch = useAppDispatch()
  const token = useAppSelector(selectAccessToken)
  const user = useAppSelector(selectAuthUser)
  const handlersRef = useRef({ onMessage, onTyping, onReaction, activeRoom })

  handlersRef.current = { onMessage, onTyping, onReaction, activeRoom }

  useEffect(() => {
    if (!enabled || !token) return undefined

    const socket = acquireChatSocket(token)
    if (!socket) return undefined

    const invalidateSummary = () => {
      dispatch(chatApi.util.invalidateTags([API_TAGS.CHAT]))
    }

    const onChatMessage = (payload) => {
      invalidateSummary()
      handlersRef.current.onMessage?.(payload)
    }

    const onChatTyping = (payload) => {
      const { activeRoom: room } = handlersRef.current
      if (!room) return
      const senderId = payload?.userId
      if (!senderId || senderId === user?.id) return
      if (payload?.roomType !== room.roomType) return
      if (room.roomType === 'DIRECT') {
        const peerId = room.directPeerUserId
        const matches =
          payload?.directPeerUserId === user?.id || senderId === peerId
        if (!matches) return
      }
      if (room.roomType === 'SUPPORT' && room.supportRequesterId) {
        if (
          payload?.supportRequesterId &&
          payload.supportRequesterId !== room.supportRequesterId
        ) {
          return
        }
      }
      handlersRef.current.onTyping?.(payload)
    }

    const onChatReaction = (payload) => {
      invalidateSummary()
      handlersRef.current.onReaction?.(payload)
    }

    socket.on('chat:summary', invalidateSummary)
    socket.on('chat:message', onChatMessage)
    socket.on('chat:typing', onChatTyping)
    socket.on('chat:reaction', onChatReaction)

    return () => {
      socket.off('chat:summary', invalidateSummary)
      socket.off('chat:message', onChatMessage)
      socket.off('chat:typing', onChatTyping)
      socket.off('chat:reaction', onChatReaction)
      releaseChatSocket()
    }
  }, [dispatch, enabled, token, user?.id])
}
