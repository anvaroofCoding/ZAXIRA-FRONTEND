/** Yandex Maps–inspired palette for warehouse map views */
export const YANDEX_MAP = {
  background: '#F5F5F5',
  buildingTop: '#E8E4E1',
  buildingSideLeft: '#D1CDC9',
  buildingSideRight: '#C4C0BC',
  buildingStroke: '#B8B4B0',
  road: '#D0D9E1',
  roadLight: '#E8EDF2',
  greenery: '#C8E6C9',
  greeneryDark: '#A8D5AA',
  text: '#333333',
  textMuted: '#666666',
  water: '#B8D4E8',
}

export const MAP_CONTROL_SHADOW = '0 2px 6px rgba(0,0,0,0.12), 0 0 1px rgba(0,0,0,0.08)'

export const mapControlSurfaceSx = {
  bgcolor: '#fff',
  borderRadius: '20px',
  boxShadow: MAP_CONTROL_SHADOW,
}

export const mapControlButtonSx = {
  width: 40,
  height: 40,
  borderRadius: '12px',
  color: '#333',
  '&:hover': { bgcolor: 'rgba(0,0,0,0.04)' },
}

/** Deterministic pseudo-random in [0, 1) from index */
const seeded = (index, salt = 0) => {
  const x = Math.sin(index * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

/** Decorative map scenery (parks, roads) for SVG backgrounds */
export const buildMapScenery = (width, height, seed = 1) => {
  const greenery = []
  const roads = []
  const patchCount = Math.max(3, Math.floor((width * height) / 180000))

  for (let i = 0; i < patchCount; i += 1) {
    const w = 80 + seeded(i, seed) * 160
    const h = 60 + seeded(i, seed + 1) * 120
    const x = seeded(i, seed + 2) * (width - w)
    const y = seeded(i, seed + 3) * (height - h)
    greenery.push({ x, y, w, h, rx: 12 + seeded(i, seed + 4) * 20 })
  }

  const roadCount = Math.max(2, Math.floor(patchCount / 2))
  for (let i = 0; i < roadCount; i += 1) {
    const horizontal = seeded(i, seed + 10) > 0.45
    if (horizontal) {
      const y = 40 + seeded(i, seed + 11) * (height - 80)
      roads.push({
        d: `M 0 ${y} Q ${width * 0.35} ${y - 18} ${width * 0.65} ${y + 12} T ${width} ${y}`,
      })
    } else {
      const x = 40 + seeded(i, seed + 12) * (width - 80)
      roads.push({
        d: `M ${x} 0 Q ${x + 14} ${height * 0.4} ${x - 10} ${height * 0.7} T ${x} ${height}`,
      })
    }
  }

  return { greenery, roads }
}
