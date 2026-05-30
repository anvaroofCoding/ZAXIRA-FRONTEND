import { io } from 'socket.io-client'
import { env } from '@/shared/config/env'

const resolveRealtimeUrl = () => {
  if (env.wsUrl) {
    return env.wsUrl
  }

  return env.apiBaseUrl.replace(/\/api\/?$/, '')
}

let sharedSocket = null
let sharedToken = null
let refCount = 0

const createSocket = (token) =>
  io(`${resolveRealtimeUrl()}/realtime`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

export const acquireChatSocket = (token) => {
  if (!token) return null
  if (!sharedSocket || sharedToken !== token) {
    sharedSocket?.disconnect()
    sharedToken = token
    sharedSocket = createSocket(token)
  }
  refCount += 1
  return sharedSocket
}

export const releaseChatSocket = () => {
  refCount = Math.max(0, refCount - 1)
  if (refCount === 0) {
    sharedSocket?.disconnect()
    sharedSocket = null
    sharedToken = null
  }
}

/** @deprecated use acquireChatSocket / releaseChatSocket */
export const createChatSocket = (token) => acquireChatSocket(token)
