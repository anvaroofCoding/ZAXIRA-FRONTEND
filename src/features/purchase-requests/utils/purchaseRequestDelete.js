export const PURCHASE_REQUEST_DELETE_WINDOW_MS = 24 * 60 * 60 * 1000

const COMMISSION_REVIEW_STATUS = 'COMMISSION_REVIEW'

/** @param {{ canDelete?: boolean, status?: string, createdAt?: string }} item */
export const canDeletePurchaseRequest = (item, { isSuperAdmin = false } = {}) => {
  if (item?.canDelete != null) {
    return Boolean(item.canDelete)
  }

  if (item?.status !== COMMISSION_REVIEW_STATUS) {
    return false
  }

  if (isSuperAdmin) {
    return true
  }

  if (!item?.createdAt) {
    return false
  }

  const elapsed = Date.now() - new Date(item.createdAt).getTime()
  return elapsed < PURCHASE_REQUEST_DELETE_WINDOW_MS
}
