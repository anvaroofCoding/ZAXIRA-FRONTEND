import {
  acquireRealtimeSocket,
  releaseRealtimeSocket,
} from '@/shared/realtime/realtimeSocket'

export const acquireChatSocket = (token) => acquireRealtimeSocket(token)

export const releaseChatSocket = () => releaseRealtimeSocket()

/** @deprecated use acquireChatSocket / releaseChatSocket */
export const createChatSocket = (token) => acquireChatSocket(token)
