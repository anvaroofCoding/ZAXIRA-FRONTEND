const normalizeUserId = (userId) => {
  if (userId == null || userId === '') return ''

  const raw = String(userId).trim()

  if (/^[a-fA-F0-9]{24}$/.test(raw)) {
    return raw.toLowerCase()
  }

  return raw
}

const resolveAuthUserId = (authUser) => authUser?.id ?? authUser?.userId ?? ''

export const isPurchaseRequestBoss = (request, authUser) => {
  if (!request || !authUser) return false

  if (request.viewerRole === 'boss') return true

  if (!request.boss) return false

  const viewerId = resolveAuthUserId(authUser)
  const bossId = normalizeUserId(request.boss.userId)

  if (viewerId && bossId && normalizeUserId(viewerId) === bossId) {
    return true
  }

  const viewerLogin = authUser.login?.trim().toLowerCase()
  const bossLogin = request.boss.login?.trim().toLowerCase()

  return Boolean(viewerLogin && bossLogin && viewerLogin === bossLogin)
}

export const areAllCommissionMembersAgreed = (request) => {
  const members = request?.commissionMembers ?? []
  const decisions = request?.memberDecisions ?? []

  if (!members.length || !decisions.length) return false

  if (decisions.some((decision) => decision.decision === 'REJECTED')) {
    return false
  }

  const decisionByUserId = new Map(
    decisions.map((decision) => [normalizeUserId(decision.userId), decision.decision]),
  )

  return members.every((member) => {
    const decision = decisionByUserId.get(normalizeUserId(member.userId))
    return decision === 'APPROVED' || decision === 'PARTIAL'
  })
}

const isTerminalAfterBoss = (status) =>
  status === 'PURCHASING' ||
  status === 'PURCHASED' ||
  status === 'WAREHOUSE_IN_TRANSIT' ||
  status === 'WAREHOUSE_COMPLETED'

export const canBossConfirmPurchaseRequest = (request, authUser) => {
  if (!request) return false

  if (request.canConfirmBossDecision === true) return true
  if (request.canConfirmBossDecision === false) return false

  if (!authUser) return false
  if (!isPurchaseRequestBoss(request, authUser)) return false
  if (request.bossDecision) return false
  if (request.status === 'REJECTED' || isTerminalAfterBoss(request.status)) return false

  return areAllCommissionMembersAgreed(request)
}

export const getBossWorkflowStatusLabel = (request) => {
  if (!request) return null

  if (request.status === 'REJECTED' && request.bossDecision === 'REJECTED') {
    return 'Rad etilgan'
  }

  if (
    request.status === 'BOSS_DECISION_PENDING' ||
    request.workflowStatus === 'BOSS_DECISION_PENDING'
  ) {
    return 'Boshliq kelishmoqda'
  }

  return null
}
