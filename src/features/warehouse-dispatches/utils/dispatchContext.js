export const isTransferDispatch = (dispatch) =>
  Boolean(
    dispatch &&
      (!dispatch.purchaseRequestId || /^TR-/i.test(dispatch.requestCode ?? '')),
  )

export const getDispatchRequestLabel = (dispatch) =>
  isTransferDispatch(dispatch) ? 'Transfer arizasi' : 'Xarid arizasi'
