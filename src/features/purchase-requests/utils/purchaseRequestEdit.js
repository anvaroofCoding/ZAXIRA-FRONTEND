const SUBMIT_PAGE_PATH = '/xaridlar/arizalar-yuborish'

const POST_BOSS_APPROVAL_STATUSES = [
  'PURCHASING',
  'PURCHASED',
  'WAREHOUSE_IN_TRANSIT',
  'WAREHOUSE_COMPLETED',
]

export const isPurchaseRequestApplicant = (item, userId) => {
  if (!item || !userId) return false

  const normalizedUserId = String(userId)

  return (
    String(item.applicant?.userId ?? '') === normalizedUserId ||
    String(item.createdById ?? '') === normalizedUserId
  )
}

export const isAuthSuperAdmin = (authUser) =>
  Boolean(authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN')

const hasMutatePermission = (authUser, canUpdatePage, canCreatePage) =>
  isAuthSuperAdmin(authUser) ||
  canUpdatePage(SUBMIT_PAGE_PATH) ||
  canCreatePage(SUBMIT_PAGE_PATH)

/** Boshliq tasdiqlamaguncha tahrirlash mumkin (shu jumladan «Boshliq kelishmoqda») */
export const isEditableBeforeBossApproval = (item) => {
  if (!item) return false

  if (item.bossDecision === 'APPROVED') {
    return false
  }

  const status = item.status
  const workflowStatus = item.workflowStatus

  if (
    POST_BOSS_APPROVAL_STATUSES.includes(status) ||
    POST_BOSS_APPROVAL_STATUSES.includes(workflowStatus)
  ) {
    return false
  }

  const isRejectedState = status === 'REJECTED' || workflowStatus === 'REJECTED'

  if (isRejectedState) {
    return item.bossDecision === 'REJECTED'
  }

  return true
}

const canEditLocally = (item, authUser, canUpdatePage, canCreatePage) => {
  if (!item || !authUser?.id) return false

  if (isAuthSuperAdmin(authUser)) {
    return true
  }

  if (!isPurchaseRequestApplicant(item, authUser.id)) {
    return false
  }

  if (!hasMutatePermission(authUser, canUpdatePage, canCreatePage)) {
    return false
  }

  return isEditableBeforeBossApproval(item)
}

/** Ariza beruvchi yoki admin (super admin) tahrirlashi mumkin */
export const canEditPurchaseRequestInReview = (
  item,
  authUser,
  canUpdatePage,
  canCreatePage = () => false,
) => {
  if (isAuthSuperAdmin(authUser)) {
    return true
  }

  const locallyAllowed = canEditLocally(item, authUser, canUpdatePage, canCreatePage)

  if (typeof item?.canEditInReview === 'boolean') {
    return item.canEditInReview || locallyAllowed
  }

  return locallyAllowed
}

export { SUBMIT_PAGE_PATH }
