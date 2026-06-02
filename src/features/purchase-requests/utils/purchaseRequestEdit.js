const SUBMIT_PAGE_PATH = '/xaridlar/arizalar-yuborish'

export const isPurchaseRequestApplicant = (item, userId) => {
  if (!item || !userId) return false
  return item.applicant?.userId === userId || item.createdById === userId
}

const isAuthSuperAdmin = (authUser) =>
  Boolean(authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN')

const hasUpdatePermission = (authUser, canUpdatePage) =>
  isAuthSuperAdmin(authUser) || canUpdatePage(SUBMIT_PAGE_PATH)

/** Komissiya tekshiruvida — admin «Tahrirlash» ruxsati bilan */
export const canEditPurchaseRequestInReview = (item, authUser, canUpdatePage) => {
  if (!item || !authUser?.id) return false
  if (item.status !== 'COMMISSION_REVIEW') return false
  if (!isPurchaseRequestApplicant(item, authUser.id) && !isAuthSuperAdmin(authUser)) {
    return false
  }
  if (!hasUpdatePermission(authUser, canUpdatePage)) return false

  if (typeof item.canEditInReview === 'boolean') {
    return item.canEditInReview
  }

  return true
}

/** Qisman tasdiqlangandan keyin — admin «Tahrirlash» ruxsati bilan */
export const canResubmitPurchaseRequest = (item, authUser, canUpdatePage) => {
  if (!item || !authUser?.id) return false
  if (item.status !== 'PARTIAL_REVISION') return false
  if (!isPurchaseRequestApplicant(item, authUser.id) && !isAuthSuperAdmin(authUser)) {
    return false
  }
  if (!hasUpdatePermission(authUser, canUpdatePage)) return false

  if (typeof item.canResubmit === 'boolean') {
    return item.canResubmit
  }

  return true
}

export { SUBMIT_PAGE_PATH }
