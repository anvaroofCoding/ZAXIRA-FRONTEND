const LEGACY_STORAGE_KEY = 'zaxira_warehouse_import_sessions'

const buildStorageKey = (userId) =>
  userId ? `zaxira_warehouse_import_sessions:${userId}` : null

const createId = () =>
  `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const clearLegacyImportSessionsStorage = () => {
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY)
  } catch {
    // ignore
  }
}

const readStore = (userId) => {
  const storageKey = buildStorageKey(userId)
  if (!storageKey) return []

  try {
    clearLegacyImportSessionsStorage()

    const raw = localStorage.getItem(storageKey)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeStore = (userId, sessions) => {
  const storageKey = buildStorageKey(userId)
  if (!storageKey) return

  localStorage.setItem(storageKey, JSON.stringify(sessions))
}

const buildTitle = (session, index) => {
  if (session.title?.trim()) return session.title.trim()

  const firstItem = (session.items ?? []).find((item) => item.name?.trim())
  if (firstItem?.name?.trim()) return firstItem.name.trim()

  return `Import ${index}`
}

const normalizeSession = (session, index = 1, userId = null) => {
  const updatedAt = session.updatedAt ?? new Date().toISOString()

  return {
    id: session.id ?? createId(),
    ownerUserId: session.ownerUserId ?? userId ?? null,
    title: buildTitle(session, index),
    preview:
      (session.items ?? []).find((item) => item.name?.trim())?.name?.trim() ||
      session.comment?.trim() ||
      '',
    locationId: session.locationId ?? '',
    items: (session.items ?? []).map((item) => ({
      name: item.name ?? '',
      characteristics: item.characteristics ?? '',
      quantity: item.quantity ?? 1,
      unit: item.unit ?? 'dona',
      manufacturingCountry: item.manufacturingCountry ?? '',
      nomenclatureCode: item.nomenclatureCode ?? '',
      unitPrice: item.unitPrice ?? 0,
    })),
    comment: session.comment ?? '',
    createdAt: session.createdAt ?? updatedAt,
    updatedAt,
    isLocal: Boolean(session.isLocal ?? String(session.id ?? '').startsWith('local-')),
    pendingServerSync: Boolean(session.pendingServerSync),
  }
}

const sortSessions = (sessions) =>
  [...sessions].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

export const mergeImportSessionItemSources = (left = {}, right = {}) => ({
  name: left.name?.trim() || right.name?.trim() || '',
  characteristics: left.characteristics?.trim() || right.characteristics?.trim() || '',
  quantity: left.quantity ?? right.quantity ?? 1,
  unit: left.unit?.trim() || right.unit?.trim() || 'dona',
  manufacturingCountry:
    left.manufacturingCountry?.trim() || right.manufacturingCountry?.trim() || '',
  nomenclatureCode:
    left.nomenclatureCode?.trim() || right.nomenclatureCode?.trim() || '',
  unitPrice:
    Number(left.unitPrice) > 0
      ? Number(left.unitPrice)
      : Math.max(0, Number(right.unitPrice) || 0),
})

export const mergeImportSessionItems = (left = [], right = []) => {
  const maxLength = Math.max(left.length, right.length)

  return Array.from({ length: maxLength }, (_, index) =>
    mergeImportSessionItemSources(left[index], right[index]),
  )
}

export const mergeImportSessionSources = (serverSession, localSession) => {
  if (!serverSession) return localSession ?? null
  if (!localSession) return serverSession

  const serverAt = new Date(serverSession.updatedAt ?? 0).getTime()
  const localAt = new Date(localSession.updatedAt ?? 0).getTime()
  const newest = localAt >= serverAt ? localSession : serverSession
  const oldest = localAt >= serverAt ? serverSession : localSession

  return {
    ...oldest,
    ...newest,
    locationId: newest.locationId || oldest.locationId || '',
    comment: newest.comment?.trim() ? newest.comment : oldest.comment ?? '',
    items: mergeImportSessionItems(newest.items, oldest.items),
  }
}

export const listLocalImportSessions = (userId) => {
  if (!userId) {
    return { items: [], total: 0, limit: 10 }
  }

  const raw = readStore(userId)
  const sessions = sortSessions(
    raw.map((session, index) => normalizeSession(session, raw.length - index, userId)),
  )

  return {
    items: sessions,
    total: sessions.length,
    limit: 10,
  }
}

export const getLocalImportSessionById = (userId, id) => {
  if (!userId || !id) return null

  const raw = readStore(userId)
  const index = raw.findIndex((session) => session.id === id)
  if (index === -1) return null

  return normalizeSession(raw[index], raw.length - index, userId)
}

export const mergeServerImportSessionsWithLocalCache = (serverData, userId) => {
  if (!userId) {
    return serverData ?? { items: [], total: 0, limit: 10 }
  }

  const local = listLocalImportSessions(userId)
  const localMap = new Map(local.items.map((session) => [session.id, session]))
  const serverItems = serverData?.items ?? []

  const merged = serverItems.map((serverSession) => {
    const cached = localMap.get(serverSession.id)
    if (!cached) return serverSession

    const cachedAt = new Date(cached.updatedAt ?? 0).getTime()
    const serverAt = new Date(serverSession.updatedAt ?? 0).getTime()

    const merged = mergeImportSessionSources(serverSession, cached)

    return {
      ...merged,
      ownerUserId: userId,
      isLocal: cached.isLocal ?? Boolean(cachedAt > serverAt),
      pendingServerSync: cached.pendingServerSync,
    }
  })

  const mergedIds = new Set(merged.map((session) => session.id))
  local.items.forEach((localSession) => {
    if (!mergedIds.has(localSession.id)) {
      merged.push({ ...localSession, ownerUserId: userId })
    }
  })

  const items = sortSessions(merged)

  return {
    items,
    total: items.length,
    limit: serverData?.limit ?? local.limit ?? 10,
  }
}

export const createLocalImportSession = (userId) => {
  if (!userId) {
    throw new Error('Foydalanuvchi aniqlanmadi')
  }

  const sessions = readStore(userId)
  if (sessions.length >= 10) {
    throw new Error('Ko‘pi bilan 10 ta faol seans bo‘lishi mumkin')
  }

  const now = new Date().toISOString()
  const session = normalizeSession(
    {
      id: createId(),
      ownerUserId: userId,
      title: `Import ${sessions.length + 1}`,
      locationId: '',
      items: [
        {
          name: '',
          characteristics: '',
          quantity: 1,
          unit: 'dona',
          manufacturingCountry: '',
          nomenclatureCode: '',
          unitPrice: 0,
        },
      ],
      comment: '',
      createdAt: now,
      updatedAt: now,
      isLocal: true,
    },
    sessions.length + 1,
    userId,
  )

  writeStore(userId, [session, ...sessions])
  return session
}

export const isMongoObjectId = (value) =>
  typeof value === 'string' && /^[a-f\d]{24}$/i.test(value)

export const persistImportSessionLocally = (userId, id, payload) => {
  if (!userId) {
    throw new Error('Foydalanuvchi aniqlanmadi')
  }

  if (isLocalImportSessionId(id)) {
    return saveLocalImportSession(userId, id, payload)
  }

  return upsertLocalImportSession(userId, id, payload)
}

export const upsertLocalImportSession = (userId, id, payload) => {
  const sessions = readStore(userId)
  const index = sessions.findIndex((session) => session.id === id)

  if (index === -1) {
    const updatedAt = new Date().toISOString()
    const session = normalizeSession(
      {
        ...payload,
        id,
        ownerUserId: userId,
        isLocal: true,
        createdAt: updatedAt,
        updatedAt,
      },
      sessions.length + 1,
      userId,
    )
    writeStore(userId, [session, ...sessions])
    return session
  }

  return saveLocalImportSession(userId, id, payload)
}

export const saveLocalImportSession = (userId, id, payload) => {
  const sessions = readStore(userId)
  const index = sessions.findIndex((session) => session.id === id)

  if (index === -1) {
    throw new Error('Faol seans topilmadi')
  }

  const current = sessions[index]
  const updatedAt = new Date().toISOString()
  const next = normalizeSession(
    {
      ...current,
      ...payload,
      id,
      ownerUserId: userId,
      isLocal: true,
      updatedAt,
    },
    sessions.length - index,
    userId,
  )

  const nextSessions = [...sessions]
  nextSessions[index] = next
  writeStore(userId, nextSessions)

  return next
}

export const deleteLocalImportSession = (userId, id) => {
  if (!userId) {
    return { id, deleted: false }
  }

  const sessions = readStore(userId).filter((session) => session.id !== id)
  writeStore(userId, sessions)
  return { id, deleted: true }
}

export const isLocalImportSessionId = (id) =>
  typeof id === 'string' && id.startsWith('local-')

export const listImportSessionsPendingServerSync = (userId) => {
  if (!userId) return []

  return readStore(userId).filter(
    (session) => session.pendingServerSync && isMongoObjectId(session.id),
  )
}

export const markImportSessionPendingServerSync = (userId, id) => {
  if (!userId || !id || isLocalImportSessionId(id)) return

  const sessions = readStore(userId)
  const index = sessions.findIndex((session) => session.id === id)
  if (index === -1) return

  sessions[index] = {
    ...sessions[index],
    pendingServerSync: true,
    isLocal: true,
  }
  writeStore(userId, sessions)
}

export const markImportSessionServerSynced = (userId, id) => {
  if (!userId || !id) return

  const sessions = readStore(userId)
  const index = sessions.findIndex((session) => session.id === id)
  if (index === -1) return

  sessions[index] = {
    ...sessions[index],
    pendingServerSync: false,
    isLocal: false,
  }
  writeStore(userId, sessions)
}
