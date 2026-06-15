import { io } from 'socket.io-client'
import { env } from '@/shared/config/env'
import { setRealtimeConnected } from '@/shared/realtime/realtimeConnectionState'
import { getDeviceId, getDeviceName } from '@/shared/utils/deviceIdentity'

const resolveRealtimeUrl = () => {
  if (env.wsUrl) {
    return env.wsUrl.replace(/\/$/, '')
  }

  return env.apiBaseUrl.replace(/\/api\/?$/, '')
}

let sharedSocket = null
let sharedToken = null
let refCount = 0

const attachCoreListeners = (socket) => {
  socket.off('connect')
  socket.off('disconnect')

  socket.on('connect', () => {
    setRealtimeConnected(true)
  })

  socket.on('disconnect', () => {
    setRealtimeConnected(false)
  })
}

const createSocket = (token) => {
  const socket = io(`${resolveRealtimeUrl()}/realtime`, {
    auth: {
      token,
      deviceId: getDeviceId(),
      deviceName: getDeviceName(),
    },
    transports: ['polling', 'websocket'],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  })

  attachCoreListeners(socket)
  return socket
}

export const acquireRealtimeSocket = (token) => {
  if (!token) {
    return null
  }

  if (!sharedSocket || sharedToken !== token) {
    sharedSocket?.removeAllListeners()
    sharedSocket?.disconnect()
    sharedToken = token
    sharedSocket = createSocket(token)
  }

  refCount += 1
  return sharedSocket
}

export const releaseRealtimeSocket = () => {
  refCount = Math.max(0, refCount - 1)

  if (refCount === 0) {
    sharedSocket?.removeAllListeners()
    sharedSocket?.disconnect()
    sharedSocket = null
    sharedToken = null
    setRealtimeConnected(false)
  }
}
