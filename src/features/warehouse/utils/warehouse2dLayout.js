const STORAGE_KEY = 'zaxira-warehouse-2d-positions-v1'

export const NODE_WIDTH = 96
export const NODE_HEIGHT = 88

export const loadWarehousePositions = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export const saveWarehousePositions = (positions) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(positions))
  } catch {
    // ignore quota errors
  }
}

export const buildCircularLayout = (structureIds, width, height) => {
  const count = structureIds.length
  if (!count) return {}

  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.max(160, Math.min(width, height) * 0.32)

  return structureIds.reduce((acc, id, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2
    acc[id] = {
      x: centerX + radius * Math.cos(angle) - NODE_WIDTH / 2,
      y: centerY + radius * Math.sin(angle) - NODE_HEIGHT / 2,
    }
    return acc
  }, {})
}

export const getNodeCenter = (position) => ({
  x: position.x + NODE_WIDTH / 2,
  y: position.y + NODE_HEIGHT / 2,
})

export const getEdgePoint = (fromCenter, toCenter) => {
  const dx = toCenter.x - fromCenter.x
  const dy = toCenter.y - fromCenter.y
  if (!dx && !dy) {
    return { ...fromCenter }
  }

  const halfW = NODE_WIDTH / 2
  const halfH = NODE_HEIGHT / 2
  const scale = Math.min(
    Math.abs(halfW / dx) || Infinity,
    Math.abs(halfH / dy) || Infinity,
  )

  return {
    x: fromCenter.x + dx * scale,
    y: fromCenter.y + dy * scale,
  }
}

export const buildRopePath = (fromCenter, toCenter) => {
  const start = getEdgePoint(fromCenter, toCenter)
  const end = getEdgePoint(toCenter, fromCenter)
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy) || 1
  const offset = Math.min(48, length * 0.18)
  const controlX = midX + (-dy / length) * offset
  const controlY = midY + (dx / length) * offset

  return {
    d: `M ${start.x} ${start.y} Q ${controlX} ${controlY} ${end.x} ${end.y}`,
    start,
    end,
  }
}

export const getConnectionGeometry = (fromPos, toPos) => {
  const fromCenter = getNodeCenter(fromPos)
  const toCenter = getNodeCenter(toPos)
  const start = getEdgePoint(fromCenter, toCenter)
  const end = getEdgePoint(toCenter, fromCenter)
  const rope = buildRopePath(fromCenter, toCenter)
  const dx = end.x - start.x
  const dy = end.y - start.y
  const length = Math.hypot(dx, dy)
  const angle = Math.atan2(dy, dx) * (180 / Math.PI)

  return {
    start,
    end,
    pathD: rope.d,
    length,
    angle,
  }
}

const edgeKey = (a, b) => [a, b].sort().join('::')

const normalizeStructureId = (value) => (value == null ? '' : String(value))

export const getTransferEndpointIds = (transfer) => ({
  fromId: normalizeStructureId(transfer.sourceStructure?.structureId),
  toId: normalizeStructureId(transfer.targetStructure?.structureId),
})

/** Faqat transfer bo'lgan ombor juftlari orasidagi bog'lanishlar */
export const buildTransferLinkPairs = (structureIds, transfers) => {
  const idSet = new Set(structureIds.map(normalizeStructureId))
  const pairs = new Map()

  transfers.forEach((transfer) => {
    const { fromId, toId } = getTransferEndpointIds(transfer)
    if (!fromId || !toId || fromId === toId) return
    if (!idSet.has(fromId) || !idSet.has(toId)) return

    const key = edgeKey(fromId, toId)
    if (!pairs.has(key)) {
      pairs.set(key, { fromId, toId, transfers: [] })
    }
    pairs.get(key).transfers.push(transfer)
  })

  return Array.from(pairs.values())
}

/** @deprecated ring + transfer — endi faqat buildTransferLinkPairs ishlatiladi */
export const buildConnectionEdges = (structureIds, transfers) =>
  buildTransferLinkPairs(structureIds, transfers).map((pair) => ({
    fromId: pair.fromId,
    toId: pair.toId,
    kind: 'transfer',
  }))

export const getPathBounds = (pathD, padding = 10) => {
  if (!pathD) {
    return { x: 0, y: 0, width: 0, height: 0 }
  }

  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  path.setAttribute('d', pathD)

  try {
    const box = path.getBBox()
    return {
      x: box.x - padding,
      y: box.y - padding,
      width: Math.max(box.width + padding * 2, 1),
      height: Math.max(box.height + padding * 2, 1),
    }
  } catch {
    return { x: 0, y: 0, width: 1, height: 1 }
  }
}

export const isActiveTransfer = (transfer) =>
  transfer.status === 'PENDING_RECEIPT' || transfer.status === 'PARTIALLY_RECEIVED'
