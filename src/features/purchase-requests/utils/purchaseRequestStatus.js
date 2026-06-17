export const BOSS_APPROVED_STATUS_LABEL = 'Tasdiqlangan'

export const PURCHASE_REQUEST_STATUS_LABELS = {
  COMMISSION_REVIEW: 'Kelishilmoqda',
  PARTIAL_REVISION: 'Kelishilmoqda',
  REJECTED: 'Rad etilgan',
  BOSS_DECISION_PENDING: 'Boshliq kelishmoqda',
  PURCHASING: 'Sotib olinmoqda',
  PURCHASED: 'Xarid qilindi',
  WAREHOUSE_IN_TRANSIT: 'Omborga jo‘natilgan',
  WAREHOUSE_COMPLETED: 'Omborga qabul qilindi',
}

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

export const APPROVAL_DECISION_LABELS = {
  APPROVED: 'Kelishildi',
  PARTIAL: 'Qisman kelishildi',
  REJECTED: 'Rad etildi',
}

export const MEMBER_DECISION_PENDING_LABEL = 'Kelishilmoqda'

export const APPROVAL_DECISION_COLORS = {
  APPROVED: 'success',
  PARTIAL: 'info',
  REJECTED: 'error',
}

export const getPurchaseRequestStatusLabel = (status, fallback = '', request) => {
  if (request?.bossDecision === 'APPROVED') {
    return BOSS_APPROVED_STATUS_LABEL
  }

  if (fallback?.trim()) {
    return fallback.trim()
  }

  if (status === 'PARTIAL_REVISION') {
    return PURCHASE_REQUEST_STATUS_LABELS.COMMISSION_REVIEW
  }

  return (status && PURCHASE_REQUEST_STATUS_LABELS[status]) || 'Nomaʼlum holat'
}

export const getApprovalDecisionLabel = (decision, fallback = '') => {
  if (!decision) {
    return MEMBER_DECISION_PENDING_LABEL
  }

  return APPROVAL_DECISION_LABELS[decision] || fallback || decision
}

export const getStatusChipColor = (status) =>
  PURCHASE_REQUEST_STATUS_COLORS[status] ?? 'default'

export const getDecisionChipColor = (decision) =>
  APPROVAL_DECISION_COLORS[decision] ?? 'default'
