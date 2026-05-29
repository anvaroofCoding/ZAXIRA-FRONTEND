export const DISPATCH_STATUS = {
  PENDING_RECEIPT: 'PENDING_RECEIPT',
  PARTIALLY_RECEIVED: 'PARTIALLY_RECEIVED',
  COMPLETED: 'COMPLETED',
}

export const getDispatchStatusChipProps = (status, statusLabel) => {
  switch (status) {
    case DISPATCH_STATUS.COMPLETED:
      return { color: 'success', label: statusLabel || 'Qabul qilindi' }
    case DISPATCH_STATUS.PARTIALLY_RECEIVED:
      return { color: 'info', label: statusLabel || 'Qisman qabul qilindi' }
    case DISPATCH_STATUS.PENDING_RECEIPT:
      return { color: 'warning', label: statusLabel || 'Qabul kutilmoqda' }
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
