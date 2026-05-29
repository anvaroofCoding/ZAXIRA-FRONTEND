import { io } from 'socket.io-client'
import { env } from '@/shared/config/env'

const resolveRealtimeUrl = () => {
  if (env.wsUrl) {
    return env.wsUrl
  }

  return env.apiBaseUrl.replace(/\/api\/?$/, '')
}

export const createChatSocket = (token) =>
  io(`${resolveRealtimeUrl()}/realtime`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })
