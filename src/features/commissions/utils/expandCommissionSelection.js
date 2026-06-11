const mapMemberSnapshotToUser = (member) => {
  const userId = member.userId ?? member.id

  return {
    id: userId,
    displayName: member.displayName,
    login: member.login,
    structureShortName: member.structureShortName ?? null,
  }
}

export const expandCommissionToSelection = (
  commission,
  users = [],
  { excludeUserId } = {},
) => {
  if (!commission) {
    return { members: [], bossId: '' }
  }

  const bossId = commission.boss?.userId ?? ''
  const usersById = new Map(users.map((user) => [user.id, user]))
  const seenMemberIds = new Set()
  const members = []

  for (const member of commission.members ?? []) {
    const userId = member.userId ?? member.id

    if (!userId || userId === excludeUserId || userId === bossId) {
      continue
    }

    if (seenMemberIds.has(userId)) {
      continue
    }

    seenMemberIds.add(userId)
    members.push(usersById.get(userId) ?? mapMemberSnapshotToUser(member))
  }

  return {
    members,
    bossId: bossId && bossId !== excludeUserId ? bossId : '',
  }
}
