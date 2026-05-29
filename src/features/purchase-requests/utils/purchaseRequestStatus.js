export const PURCHASE_REQUEST_STATUS_COLORS = {
  COMMISSION_REVIEW: 'warning',
  PARTIAL_REVISION: 'info',
  REJECTED: 'error',
  BOSS_DECISION_PENDING: 'secondary',
  PURCHASING: 'success',
  PURCHASED: 'primary',
  WAREHOUSE_IN_TRANSIT: 'warning',
  WAREHOUSE_COMPLETED: 'success',
}

export const APPROVAL_DECISION_COLORS = {
  APPROVED: 'success',
  PARTIAL: 'info',
  REJECTED: 'error',
}

export const getStatusChipColor = (status) =>
  PURCHASE_REQUEST_STATUS_COLORS[status] ?? 'default'

export const getDecisionChipColor = (decision) =>
  APPROVAL_DECISION_COLORS[decision] ?? 'default'
