let connected = false

export const setRealtimeConnected = (value) => {
  connected = Boolean(value)
}

export const isRealtimeConnected = () => connected
