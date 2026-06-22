import { useMemo } from 'react'
import { buildMapScenery, YANDEX_MAP } from '@/features/warehouse/utils/warehouseMapTheme'

export const WarehouseMapBackground = ({ width, height, seed = 1, variant = '2d' }) => {
  const scenery = useMemo(() => buildMapScenery(width, height, seed), [width, height, seed])

  if (width < 1 || height < 1) return null

  return (
    <svg
      width={width}
      height={height}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        pointerEvents: 'none',
        zIndex: 0,
      }}
      aria-hidden
    >
      <rect width="100%" height="100%" fill={YANDEX_MAP.background} />

      {scenery.greenery.map((patch, index) => (
        <rect
          key={`g-${index}`}
          x={patch.x}
          y={patch.y}
          width={patch.w}
          height={patch.h}
          rx={patch.rx}
          fill={index % 2 === 0 ? YANDEX_MAP.greenery : YANDEX_MAP.greeneryDark}
          opacity={0.55}
        />
      ))}

      {scenery.roads.map((road, index) => (
        <g key={`r-${index}`}>
          <path
            d={road.d}
            fill="none"
            stroke={YANDEX_MAP.road}
            strokeWidth={variant === '3d' ? 22 : 18}
            strokeLinecap="round"
            opacity={0.85}
          />
          <path
            d={road.d}
            fill="none"
            stroke={YANDEX_MAP.roadLight}
            strokeWidth={variant === '3d' ? 10 : 8}
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>
      ))}
    </svg>
  )
}
