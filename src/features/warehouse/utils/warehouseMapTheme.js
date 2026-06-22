export const MAP_TILE_SIZE = 640

const LIGHT_MAP = {
  background: '#F5F5F5',
  buildingTop: '#E8E4E1',
  buildingSideLeft: '#D1CDC9',
  buildingSideRight: '#C4C0BC',
  buildingStroke: '#B8B4B0',
  road: '#D0D9E1',
  roadLight: '#E8EDF2',
  greenery: '#C8E6C9',
  greeneryMid: '#B5DFB7',
  greeneryDark: '#A8D5AA',
  text: '#333333',
  textMuted: '#666666',
  water: '#B8D4E8',
  buildingShadow: 'rgba(0,0,0,0.1)',
  buildingShadowHover: 'rgba(0,0,0,0.14)',
}

const DARK_MAP = {
  background: '#1a1e26',
  buildingTop: '#3d4452',
  buildingSideLeft: '#2f3540',
  buildingSideRight: '#272c36',
  buildingStroke: '#4f5868',
  road: '#2a3340',
  roadLight: '#3a4554',
  greenery: '#2a4a34',
  greeneryMid: '#234030',
  greeneryDark: '#1c3528',
  text: '#e8eaed',
  textMuted: '#9aa0a6',
  water: '#1e3d56',
  buildingShadow: 'rgba(0,0,0,0.35)',
  buildingShadowHover: 'rgba(0,0,0,0.5)',
}

export const WAREHOUSE_MAP_PALETTES = {
  light: LIGHT_MAP,
  dark: DARK_MAP,
}

/** @deprecated — use getWarehouseMapPalette(mode) */
export const YANDEX_MAP = LIGHT_MAP

export const getWarehouseMapPalette = (mode = 'light') =>
  mode === 'dark' ? DARK_MAP : LIGHT_MAP

export const getGreenTones = (palette) => [palette.greenery, palette.greeneryDark, palette.greeneryMid]

export const MAP_CONTROL_SHADOW_LIGHT = '0 2px 6px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)'
export const MAP_CONTROL_SHADOW_DARK = '0 2px 8px rgba(0,0,0,0.5), 0 0 1px rgba(255,255,255,0.08)'

/** @deprecated — use getMapControlSurfaceSx(theme) */
export const MAP_CONTROL_SHADOW = MAP_CONTROL_SHADOW_LIGHT

/** @deprecated — use getMapControlSurfaceSx(theme) */
export const mapControlSurfaceSx = {
  bgcolor: '#fff',
  borderRadius: '20px',
  boxShadow: MAP_CONTROL_SHADOW_LIGHT,
}

/** @deprecated — use getMapControlButtonSx(theme) */
export const mapControlButtonSx = {
  width: 40,
  height: 40,
  borderRadius: '12px',
  color: '#333',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
}

export const getMapControlSurfaceSx = (theme) => ({
  bgcolor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderRadius: '20px',
  boxShadow: theme.palette.mode === 'dark' ? MAP_CONTROL_SHADOW_DARK : MAP_CONTROL_SHADOW_LIGHT,
  border:
    theme.palette.mode === 'dark'
      ? `1px solid ${theme.palette.divider}`
      : '1px solid transparent',
})

export const getMapControlButtonSx = (theme) => ({
  width: 40,
  height: 40,
  borderRadius: '12px',
  color: theme.palette.text.primary,
  '&:hover': {
    bgcolor:
      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
  },
})
/** Deterministic pseudo-random in [0, 1) */
const seeded = (index, salt = 0) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Har bir katak uchun noyob seed */
export const tileSeedFromCoords = (tx, ty, baseSeed = 1) => {
  const n = Math.sin(tx * 127.1 + ty * 311.7 + baseSeed * 52.3) * 43758.5453
  return 1 + Math.floor((n - Math.floor(n)) * 10000)
}

/**
 * Har bir plitka uchun turli manzara: parklar, yo'llar, suv, dekorativ binolar.
 */
export const buildMapScenery = (width, height, seed = 1) => {
  const greenery = []
  const roads = []
  const water = []
  const blocks = []

  const patchCount = 2 + Math.floor(seeded(0, seed) * 5)
  const waterCount = seeded(1, seed) > 0.72 ? 1 : seeded(1, seed + 0.5) > 0.88 ? 2 : 0
  const blockCount = 1 + Math.floor(seeded(2, seed) * 4)

  for (let i = 0; i < patchCount; i += 1) {
    const w = 50 + seeded(i, seed + 3) * 200
    const h = 40 + seeded(i, seed + 4) * 150
    const x = seeded(i, seed + 5) * Math.max(1, width - w - 20) + 10
    const y = seeded(i, seed + 6) * Math.max(1, height - h - 20) + 10
    const isRound = seeded(i, seed + 7) > 0.55
    greenery.push({
      x,
      y,
      w,
      h,
      rx: isRound ? Math.min(w, h) * 0.35 : 4 + seeded(i, seed + 8) * 16,
      tone: Math.floor(seeded(i, seed + 9) * 3),
    })
  }

  for (let i = 0; i < waterCount; i += 1) {
    const w = 60 + seeded(i, seed + 20) * 140
    const h = 40 + seeded(i, seed + 21) * 100
    water.push({
      x: seeded(i, seed + 22) * (width - w - 30) + 15,
      y: seeded(i, seed + 23) * (height - h - 30) + 15,
      w,
      h,
      rx: 8 + seeded(i, seed + 24) * 24,
    })
  }

  for (let i = 0; i < blockCount; i += 1) {
    const w = 28 + seeded(i, seed + 30) * 70
    const h = 22 + seeded(i, seed + 31) * 55
    blocks.push({
      x: seeded(i, seed + 32) * (width - w - 24) + 12,
      y: seeded(i, seed + 33) * (height - h - 24) + 12,
      w,
      h,
      rx: 2 + seeded(i, seed + 34) * 5,
    })
  }

  const roadStyle = Math.floor(seeded(3, seed + 40) * 4)
  const roadCount = 1 + Math.floor(seeded(4, seed + 41) * 3)

  for (let i = 0; i < roadCount; i += 1) {
    const variant = (roadStyle + i) % 4
    if (variant === 0) {
      const y = 30 + seeded(i, seed + 50) * (height - 60)
      roads.push({
        d: `M 0 ${y} Q ${width * 0.3} ${y - 22} ${width * 0.55} ${y + 8} T ${width} ${y - 6}`,
        width: 14 + seeded(i, seed + 51) * 10,
      })
    } else if (variant === 1) {
      const x = 30 + seeded(i, seed + 52) * (width - 60)
      roads.push({
        d: `M ${x} 0 Q ${x + 18} ${height * 0.35} ${x - 8} ${height * 0.65} T ${x + 12} ${height}`,
        width: 14 + seeded(i, seed + 53) * 10,
      })
    } else if (variant === 2) {
      const y = height * (0.25 + seeded(i, seed + 54) * 0.5)
      roads.push({
        d: `M 0 ${y} L ${width} ${y + (seeded(i, seed + 55) > 0.5 ? 18 : -14)}`,
        width: 12 + seeded(i, seed + 56) * 8,
      })
    } else {
      const cx = width * (0.3 + seeded(i, seed + 57) * 0.4)
      const cy = height * (0.3 + seeded(i, seed + 58) * 0.4)
      roads.push({
        d: `M ${cx - 80} ${cy} Q ${cx} ${cy - 40} ${cx + 90} ${cy + 20}`,
        width: 10 + seeded(i, seed + 59) * 8,
      })
    }
  }

  return { greenery, roads, water, blocks }
}

/** Ko'rinadigan katak indekslari (virtualizatsiya) */
export const getVisibleMapTiles = (
  viewport,
  canvasWidth,
  canvasHeight,
  tileSize = MAP_TILE_SIZE,
  bufferTiles = 2,
) => {
  if (canvasWidth < 1 || canvasHeight < 1) return []

  const scale = viewport.scale || 1
  const vx = viewport.x || 0
  const vy = viewport.y || 0

  const minWx = -vx / scale - tileSize * bufferTiles
  const maxWx = (canvasWidth - vx) / scale + tileSize * bufferTiles
  const minWy = -vy / scale - tileSize * bufferTiles
  const maxWy = (canvasHeight - vy) / scale + tileSize * bufferTiles

  const minTx = Math.floor(minWx / tileSize)
  const maxTx = Math.floor(maxWx / tileSize)
  const minTy = Math.floor(minWy / tileSize)
  const maxTy = Math.floor(maxWy / tileSize)

  const tiles = []
  for (let ty = minTy; ty <= maxTy; ty += 1) {
    for (let tx = minTx; tx <= maxTx; tx += 1) {
      tiles.push({ tx, ty })
    }
  }
  return tiles
}
