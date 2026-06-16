const SUBMIT_PAGE_PATH = '/xaridlar/arizalar-yuborish'

export const isPurchaseRequestApplicant = (item, userId) => {
  if (!item || !userId) return false
  return item.applicant?.userId === userId || item.createdById === userId
}

const isAuthSuperAdmin = (authUser) =>
  Boolean(authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN')

const hasUpdatePermission = (authUser, canUpdatePage) =>
  isAuthSuperAdmin(authUser) || canUpdatePage(SUBMIT_PAGE_PATH)

/** Kelishilmoqda holatida — admin «Tahrirlash» ruxsati bilan */
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

/** Komissiya rad etgandan keyin — faqat rad etgan a’zolarga qayta yuborish */
export const canResubmitPurchaseRequest = (item, authUser, canUpdatePage) => {
  if (!item || !authUser?.id) return false

  const hasRejected =
    (item.rejectedMemberIds?.length ?? 0) > 0 ||
    item.memberDecisions?.some((member) => member.decision === 'REJECTED')

  if (!hasRejected) return false

  const inCommissionPhase =
    item.status === 'COMMISSION_REVIEW' || item.status === 'PARTIAL_REVISION'

  if (!inCommissionPhase) return false

  if (!isPurchaseRequestApplicant(item, authUser.id) && !isAuthSuperAdmin(authUser)) {
    return false
  }
  if (!hasUpdatePermission(authUser, canUpdatePage)) return false

  if (typeof item.canResubmit === 'boolean') {
    return item.canResubmit
  }

  return true
}

/** Boshliq rad etgandan keyin — faqat boshliqqa qayta yuborish */
export const canResubmitPurchaseRequestToBoss = (item, authUser, canUpdatePage) => {
  if (!item || !authUser?.id) return false
  if (item.status !== 'REJECTED' || item.bossDecision !== 'REJECTED') return false

  if (!isPurchaseRequestApplicant(item, authUser.id) && !isAuthSuperAdmin(authUser)) {
    return false
  }
  if (!hasUpdatePermission(authUser, canUpdatePage)) return false

  if (typeof item.canResubmitToBoss === 'boolean') {
    return item.canResubmitToBoss
  }

  return true
}

export const canResubmitAnyPurchaseRequest = (item, authUser, canUpdatePage) =>
  canResubmitPurchaseRequest(item, authUser, canUpdatePage) ||
  canResubmitPurchaseRequestToBoss(item, authUser, canUpdatePage)

export { SUBMIT_PAGE_PATH }
