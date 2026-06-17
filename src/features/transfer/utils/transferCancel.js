export const getViewerStructureId = (user) =>
  user?.structureId ?? user?.structure?.id ?? ''

const normalizeId = (value) => {
  if (value == null || value === '') return ''
  return String(value).trim()
}

export const isOutgoingTransferForUser = (dispatch, user) => {
  if (!dispatch || !user) return false

  if (user.isSuperAdmin || user.role === 'SUPER_ADMIN') return true

  const viewerStructureId = getViewerStructureId(user)
  const sourceId = dispatch.sourceStructure?.structureId
  const dispatchedById = dispatch.dispatchedBy?.userId

  if (
    viewerStructureId &&
    sourceId &&
    normalizeId(viewerStructureId) === normalizeId(sourceId)
  ) {
    return true
  }

  if (user.id && dispatchedById && normalizeId(user.id) === normalizeId(dispatchedById)) {
    return true
  }

  return false
}

export const isDispatchCancelableState = (dispatch) => {
  if (!dispatch || dispatch.status !== 'PENDING_RECEIPT') return false
  if (dispatch.items?.some((item) => (item.quantityReceived ?? 0) > 0)) return false

  const pendingTotal =
    dispatch.pendingTotal ??
    dispatch.items?.reduce((sum, item) => sum + Math.max(0, item.quantityPending ?? 0), 0) ??
    0

  if (pendingTotal > 0) return true

  return dispatch.items?.some((item) => {
    const pending =
      (item.quantityDispatched ?? 0) -
      (item.quantityReceived ?? 0) -
      (item.quantityRejected ?? 0)
    return pending > 0
  })
}

export const canShowCancelTransfer = (dispatch, user) => {
  if (!isDispatchCancelableState(dispatch)) return false
  return isOutgoingTransferForUser(dispatch, user)
}

export const canCancelDispatchForUser = (dispatch, user) =>
  Boolean(dispatch?.canCancel) || canShowCancelTransfer(dispatch, user)
