export const DISPATCH_STATUS = {
  PENDING_RECEIPT: 'PENDING_RECEIPT',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
}

export const getTransfer2DMarkerColor = (status) => {
  switch (status) {
    case DISPATCH_STATUS.COMPLETED:
      return 'success'
    case DISPATCH_STATUS.CANCELLED:
      return 'error'
    case DISPATCH_STATUS.PENDING_RECEIPT:
    case DISPATCH_STATUS.PARTIALLY_RECEIVED:
      return 'warning'
    default:
      return 'info'
  }
}

export const getDispatchStatusChipProps = (status, statusLabel) => {
  switch (status) {
    case DISPATCH_STATUS.COMPLETED:
      return { color: 'success', label: statusLabel || 'Qabul qilindi' }
    case DISPATCH_STATUS.PARTIALLY_RECEIVED:
      return { color: 'info', label: statusLabel || 'Qisman qabul qilindi' }
    case DISPATCH_STATUS.PENDING_RECEIPT:
      return { color: 'warning', label: statusLabel || 'Qabul kutilmoqda' }
    case DISPATCH_STATUS.CANCELLED:
      return { color: 'error', label: statusLabel || 'Bekor qilindi' }
    default:
      return { color: 'default', label: statusLabel || '—' }
  }
}

export const resolveTransferDirection = (item, viewerStructureId) => {
  const targetId = item.targetStructure?.structureId
  const sourceId = item.sourceStructure?.structureId

  if (viewerStructureId && targetId === viewerStructureId) {
    return { label: 'Kelgan', movementLabel: 'Kirim', color: 'success' }
  }

  if (viewerStructureId && sourceId === viewerStructureId) {
    return { label: 'Ketgan', movementLabel: 'Chiqim', color: 'warning' }
  }

  return { label: 'Transfer', movementLabel: 'Transfer', color: 'default' }
}
