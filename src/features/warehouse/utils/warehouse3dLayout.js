const COS30 = Math.cos(Math.PI / 6)
const SIN30 = Math.sin(Math.PI / 6)

export const BUILDING_WIDTH = 72
export const BUILDING_DEPTH = 56
export const MIN_BUILDING_HEIGHT = 28
export const MAX_BUILDING_HEIGHT = 140
export const GRID_SPACING = 156

/** 3D world (x,y,z) → 2D isometric screen */
export const worldToIso = (x, y, z = 0) => ({
  x: (x - y) * COS30,
  y: (x + y) * SIN30 - z,
})

export const getBuildingHeight = (totalQuantity, maxQuantity) => {
  if (!maxQuantity) return MIN_BUILDING_HEIGHT
  const ratio = Math.min(1, Math.max(0, totalQuantity / maxQuantity))
  return MIN_BUILDING_HEIGHT + ratio * (MAX_BUILDING_HEIGHT - MIN_BUILDING_HEIGHT)
}

export const buildWarehouseGrid3D = (structureIds) => {
  const count = structureIds.length
  if (!count) return { positions: {}, bounds: { width: 0, height: 0 } }

  const cols = Math.ceil(Math.sqrt(count))
  const rows = Math.ceil(count / cols)

  const positions = structureIds.reduce((acc, id, index) => {
    const col = index % cols
    const row = Math.floor(index / cols)
    acc[id] = {
      x: col * GRID_SPACING,
      y: row * GRID_SPACING,
    }
    return acc
  }, {})

  const gridWidth = (cols - 1) * GRID_SPACING + BUILDING_WIDTH
  const gridDepth = (rows - 1) * GRID_SPACING + BUILDING_DEPTH

  return {
    positions,
    bounds: { width: gridWidth, height: gridDepth, cols, rows },
  }
}

/** Isometric box faces as SVG polygon points */
export const getIsoBoxFaces = (cx, cy, width, depth, height) => {
  const hw = width / 2
  const hd = depth / 2
  const base = {
    nw: worldToIso(cx - hw, cy - hd, 0),
    ne: worldToIso(cx + hw, cy - hd, 0),
    se: worldToIso(cx + hw, cy + hd, 0),
    sw: worldToIso(cx - hw, cy + hd, 0),
  }
  const top = {
    nw: worldToIso(cx - hw, cy - hd, height),
    ne: worldToIso(cx + hw, cy - hd, height),
    se: worldToIso(cx + hw, cy + hd, height),
    sw: worldToIso(cx - hw, cy + hd, height),
  }

  const pt = (p) => `${p.x},${p.y}`

  return {
    top: `${pt(top.nw)} ${pt(top.ne)} ${pt(top.se)} ${pt(top.sw)}`,
    left: `${pt(base.sw)} ${pt(base.se)} ${pt(top.se)} ${pt(top.sw)}`,
    right: `${pt(base.se)} ${pt(base.ne)} ${pt(top.ne)} ${pt(top.se)}`,
    front: `${pt(base.sw)} ${pt(base.se)} ${pt(top.se)} ${pt(top.sw)}`,
    center: worldToIso(cx, cy, height),
    baseCenter: worldToIso(cx, cy, 0),
  }
}

export const getIsoConnectionPath = (from, to, fromHeight, toHeight) => {
  const start = worldToIso(from.x, from.y, fromHeight * 0.85)
  const end = worldToIso(to.x, to.y, toHeight * 0.85)
  const midX = (start.x + end.x) / 2
  const midY = (start.y + end.y) / 2 - 24

  return `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`
}

export const getSceneBounds = (structureIds, positions, heights) => {
  if (!structureIds.length) {
    return { minX: 0, minY: 0, maxX: 400, maxY: 300 }
  }

  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity

  structureIds.forEach((id) => {
    const pos = positions[id]
    const h = heights[id] ?? MIN_BUILDING_HEIGHT
    if (!pos) return

    const cx = pos.x + BUILDING_WIDTH / 2
    const cy = pos.y + BUILDING_DEPTH / 2
    const faces = getIsoBoxFaces(cx, cy, BUILDING_WIDTH, BUILDING_DEPTH, h)
    ;[faces.top, faces.left, faces.right].forEach((poly) => {
      poly.split(' ').forEach((pair) => {
        const [x, y] = pair.split(',').map(Number)
        minX = Math.min(minX, x)
        minY = Math.min(minY, y)
        maxX = Math.max(maxX, x)
        maxY = Math.max(maxY, y)
      })
    })
  })

  const pad = 48
  return {
    minX: minX - pad,
    minY: minY - pad,
    maxX: maxX + pad,
    maxY: maxY + pad,
  }
}

/** @deprecated pan is no longer clamped */
export const clampIsoViewTransform = (transform) => transform

export const getLocationStackPaths = (cx, cy, buildingHeight, locations, maxLocQty) => {
  if (!locations?.length) return []

  const sliceHeight = Math.min(12, buildingHeight / Math.max(locations.length, 1))
  const baseZ = buildingHeight + 4

  return locations.map((loc, index) => {
    const ratio = maxLocQty ? Math.min(1, loc.totalQuantity / maxLocQty) : 0.3
    const w = BUILDING_WIDTH * (0.35 + ratio * 0.45)
    const d = BUILDING_DEPTH * 0.55
    const h = sliceHeight
    const offsetX = (index - (locations.length - 1) / 2) * (w * 0.55)
    const faces = getIsoBoxFaces(cx + offsetX, cy, w, d, h)
    const lifted = {
      top: faces.top
        .split(' ')
        .map((pair) => {
          const [x, y] = pair.split(',').map(Number)
          return `${x},${y - baseZ}`
        })
        .join(' '),
      left: faces.left
        .split(' ')
        .map((pair) => {
          const [x, y] = pair.split(',').map(Number)
          return `${x},${y - baseZ}`
        })
        .join(' '),
      right: faces.right
        .split(' ')
        .map((pair) => {
          const [x, y] = pair.split(',').map(Number)
          return `${x},${y - baseZ}`
        })
        .join(' '),
    }

    return { location: loc, faces: lifted, index }
  })
}
