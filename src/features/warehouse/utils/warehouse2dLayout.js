const STORAGE_KEY = 'zaxira-warehouse-2d-positions-v2'

export const NODE_WIDTH = 96
export const NODE_HEIGHT = 88
export const MIN_NODE_GAP = 48
export const CANVAS_MARGIN = 12

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
  const minChord = NODE_WIDTH + MIN_NODE_GAP
  const radiusFromCount =
    count > 1 ? minChord / (2 * Math.sin(Math.PI / count)) : 0
  const radius = Math.max(
    radiusFromCount,
    NODE_HEIGHT + MIN_NODE_GAP,
    Math.min(width, height) * 0.36,
    220,
  )

  const positions = structureIds.reduce((acc, id, index) => {
    const angle = (2 * Math.PI * index) / count - Math.PI / 2
    acc[id] = {
      x: centerX + radius * Math.cos(angle) - NODE_WIDTH / 2,
      y: centerY + radius * Math.sin(angle) - NODE_HEIGHT / 2,
    }
    return acc
  }, {})

  return resolvePositionCollisions(positions, structureIds, width, height)
}

export const clampNodeToCanvas = (
  position,
  canvasWidth,
  canvasHeight,
  margin = CANVAS_MARGIN,
) => ({
  x: Math.max(margin, Math.min(canvasWidth - NODE_WIDTH - margin, position.x)),
  y: Math.max(margin, Math.min(canvasHeight - NODE_HEIGHT - margin, position.y)),
})

export const nodesOverlap = (a, b, gap = MIN_NODE_GAP) =>
  !(
    a.x + NODE_WIDTH + gap <= b.x ||
    b.x + NODE_WIDTH + gap <= a.x ||
    a.y + NODE_HEIGHT + gap <= b.y ||
    b.y + NODE_HEIGHT + gap <= a.y
  )

const separatePair = (a, b, gap = MIN_NODE_GAP) => {
  const overlapX = NODE_WIDTH + gap - Math.abs(a.x + NODE_WIDTH / 2 - (b.x + NODE_WIDTH / 2))
  const overlapY = NODE_HEIGHT + gap - Math.abs(a.y + NODE_HEIGHT / 2 - (b.y + NODE_HEIGHT / 2))

  if (overlapX <= 0 && overlapY <= 0) return null

  if (overlapX > 0 && (overlapX <= overlapY || overlapY <= 0)) {
    const dir = a.x <= b.x ? -1 : 1
    return { dx: dir * (overlapX / 2 + 1), dy: 0 }
  }

  const dir = a.y <= b.y ? -1 : 1
  return { dx: 0, dy: dir * (overlapY / 2 + 1) }
}

export const resolvePositionCollisions = (
  positions,
  structureIds,
  canvasWidth,
  canvasHeight,
  gap = MIN_NODE_GAP,
) => {
  const ids = structureIds.filter((id) => positions[id])
  if (!ids.length) return {}

  const next = Object.fromEntries(ids.map((id) => [id, { ...positions[id] }]))

  for (let pass = 0; pass < 16; pass += 1) {
    let moved = false

    for (let i = 0; i < ids.length; i += 1) {
      for (let j = i + 1; j < ids.length; j += 1) {
        const idA = ids[i]
        const idB = ids[j]
        const a = next[idA]
        const b = next[idB]

        if (!nodesOverlap(a, b, gap)) continue

        const push = separatePair(a, b, gap)
        if (!push) continue

        next[idA] = clampNodeToCanvas(
          { x: a.x + push.dx, y: a.y + push.dy },
          canvasWidth,
          canvasHeight,
        )
        next[idB] = clampNodeToCanvas(
          { x: b.x - push.dx, y: b.y - push.dy },
          canvasWidth,
          canvasHeight,
        )
        moved = true
      }
    }

    if (!moved) break
  }

  return next
}

export const adjustDragPosition = (
  structureId,
  targetPosition,
  positions,
  canvasWidth,
  canvasHeight,
  gap = MIN_NODE_GAP,
) => {
  let pos = clampNodeToCanvas(targetPosition, canvasWidth, canvasHeight)
  const otherIds = Object.keys(positions).filter((id) => id !== structureId)

  for (let pass = 0; pass < 20; pass += 1) {
    let collided = false

    for (const id of otherIds) {
      const other = positions[id]
      if (!other || !nodesOverlap(pos, other, gap)) continue

      collided = true
      const push = separatePair(pos, other, gap)
      if (!push) continue

      pos = clampNodeToCanvas(
        { x: pos.x + push.dx, y: pos.y + push.dy },
        canvasWidth,
        canvasHeight,
      )
    }

    if (!collided) break
  }

  return pos
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

export const MIN_ZOOM = 0.25
export const MAX_ZOOM = 3

export const clampZoom = (scale) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale))

export const computeFitViewport = (positions, canvasWidth, canvasHeight, padding = 48) => {
  const entries = Object.values(positions)
  if (!entries.length || canvasWidth < 1 || canvasHeight < 1) {
    return { scale: 1, x: 0, y: 0 }
  }

  const minX = Math.min(...entries.map((p) => p.x))
  const minY = Math.min(...entries.map((p) => p.y))
  const maxX = Math.max(...entries.map((p) => p.x + NODE_WIDTH))
  const maxY = Math.max(...entries.map((p) => p.y + NODE_HEIGHT))
  const contentW = maxX - minX
  const contentH = maxY - minY

  const scale = clampZoom(
    Math.min((canvasWidth - padding * 2) / contentW, (canvasHeight - padding * 2) / contentH),
  )
  const x = (canvasWidth - contentW * scale) / 2 - minX * scale
  const y = (canvasHeight - contentH * scale) / 2 - minY * scale

  return { scale, x, y }
}

export const zoomViewportAtPoint = (viewport, pointerX, pointerY, deltaFactor) => {
  const nextScale = clampZoom(viewport.scale * deltaFactor)
  const ratio = nextScale / viewport.scale

  return {
    scale: nextScale,
    x: pointerX - (pointerX - viewport.x) * ratio,
    y: pointerY - (pointerY - viewport.y) * ratio,
  }
}

export const matchesWarehouseSearch = (warehouse, query) => {
  const q = query.trim().toLowerCase()
  if (!q) return true

  const { structure, locations = [] } = warehouse
  if (structure.shortName?.toLowerCase().includes(q)) return true
  if (structure.fullName?.toLowerCase().includes(q)) return true
  return locations.some((loc) => loc.name?.toLowerCase().includes(q))
}
