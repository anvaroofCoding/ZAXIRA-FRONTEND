const initialState = {
  open: false,
  view: 'list',
  tab: 'GLOBAL',
  selectedPeerId: '',
  selectedSupportRequesterId: '',
  userId: '',
  isSupportOperator: false,
}

let state = { ...initialState }

export const setChatUiState = (partial) => {
  state = { ...state, ...partial }
}

export const resetChatUiState = () => {
  state = { ...initialState }
}

export const shouldSuppressChatToast = (payload) => {
  if (!payload || !state.open || state.view !== 'thread') {
    return false
  }

  if (payload.roomType !== state.tab) {
    return false
  }

  if (state.tab === 'GLOBAL') {
    return true
  }

  if (state.tab === 'DIRECT') {
    const senderId = String(payload.senderId ?? '')
    return (
      senderId === String(state.selectedPeerId) ||
      senderId === String(state.userId)
    )
  }

  if (state.tab === 'SUPPORT') {
    const requesterId = state.isSupportOperator
      ? state.selectedSupportRequesterId
      : state.userId
    return String(payload.supportRequesterId ?? '') === String(requesterId ?? '')
  }

  return false
}
