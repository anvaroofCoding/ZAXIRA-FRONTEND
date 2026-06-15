import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  open: false,
  message: '',
  severity: 'info',
  duration: 4500,
}

const notificationSlice = createSlice({
  name: 'notification',
  initialState,
  reducers: {
    showNotification: (state, action) => {
      state.open = true
      state.message = action.payload.message
      state.severity = action.payload.severity ?? 'info'
      state.duration = action.payload.duration ?? 4500
    },
    hideNotification: (state) => {
      state.open = false
    },
  },
})

export const { showNotification, hideNotification } = notificationSlice.actions
export const selectNotification = (state) => state.notification

export default notificationSlice.reducer
