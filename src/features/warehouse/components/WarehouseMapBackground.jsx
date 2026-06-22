import { useMemo } from 'react'
import {
  buildMapScenery,
  getGreenTones,
  getVisibleMapTiles,
  MAP_TILE_SIZE,
  tileSeedFromCoords,
} from '@/features/warehouse/utils/warehouseMapTheme'
import { useWarehouseMapPalette } from '@/features/warehouse/hooks/useWarehouseMapPalette'

const MapTileContent = ({ seed, variant, mapPalette }) => {
  const scenery = useMemo(
    () => buildMapScenery(MAP_TILE_SIZE, MAP_TILE_SIZE, seed),
    [seed],
  )
  const greenTones = useMemo(() => getGreenTones(mapPalette), [mapPalette])

  return (
    <>
      <rect width={MAP_TILE_SIZE} height={MAP_TILE_SIZE} fill={mapPalette.background} />

      {scenery.water.map((patch, index) => (
        <rect
          key={`w-${index}`}
          x={patch.x}
          y={patch.y}
          width={patch.w}
          height={patch.h}
          rx={patch.rx}
          fill={mapPalette.water}
          opacity={0.65}
        />
      ))}

      {scenery.greenery.map((patch, index) => (
        <rect
          key={`g-${index}`}
          x={patch.x}
          y={patch.y}
          width={patch.w}
          height={patch.h}
          rx={patch.rx}
          fill={greenTones[patch.tone % greenTones.length]}
          opacity={0.5 + (patch.tone % 3) * 0.08}
        />
      ))}

      {scenery.blocks.map((block, index) => (
        <rect
          key={`b-${index}`}
          x={block.x}
          y={block.y}
          width={block.w}
          height={block.h}
          rx={block.rx}
          fill={mapPalette.buildingTop}
          stroke={mapPalette.buildingStroke}
          strokeWidth={0.6}
          opacity={0.85}
        />
      ))}

      {scenery.roads.map((road, index) => (
        <g key={`r-${index}`}>
          <path
            d={road.d}
            fill="none"
            stroke={mapPalette.road}
            strokeWidth={road.width ?? (variant === '3d' ? 20 : 16)}
            strokeLinecap="round"
            opacity={0.85}
          />
          <path
            d={road.d}
            fill="none"
            stroke={mapPalette.roadLight}
            strokeWidth={(road.width ?? 16) * 0.45}
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>
      ))}
    </>
  )
}

const VariedTileGrid = ({ tiles, baseSeed, variant, idPrefix, mapPalette }) =>
  tiles.map(({ tx, ty }) => {
    const tileSeed = tileSeedFromCoords(tx, ty, baseSeed)
    return (
      <g
        key={`${idPrefix}-${tx}-${ty}`}
        transform={`translate(${tx * MAP_TILE_SIZE}, ${ty * MAP_TILE_SIZE})`}
      >
        <MapTileContent seed={tileSeed} variant={variant} mapPalette={mapPalette} />
      </g>
    )
  })

/** 2D: faqat ko'rinadigan kataklar, har biri boshqacha */
export const WarehouseMapInfiniteLayer = ({
  baseSeed = 2,
  variant = '2d',
  viewport = { scale: 1, x: 0, y: 0 },
  canvasSize = { width: 900, height: 640 },
}) => {
  const { palette: mapPalette } = useWarehouseMapPalette()

  const tiles = useMemo(
    () => getVisibleMapTiles(viewport, canvasSize.width, canvasSize.height),
    [viewport.x, viewport.y, viewport.scale, canvasSize.width, canvasSize.height],
  )

  return (
    <svg
      aria-hidden
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: canvasSize.width,
        height: canvasSize.height,
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    >
      <VariedTileGrid
        tiles={tiles}
        baseSeed={baseSeed}
        variant={variant}
        idPrefix="2d"
        mapPalette={mapPalette}
      />
    </svg>
  )
}

/** 3D: sahna koordinatalarida turli kataklar */
export const WarehouseMapInfiniteFloor = ({
  baseSeed = 3,
  variant = '3d',
  viewTransform = { scale: 1, x: 0, y: 0 },
  sceneBounds = { minX: 0, minY: 0, maxX: 400, maxY: 300 },
  canvasSize = { width: 900, height: 640 },
}) => {
  const { palette: mapPalette } = useWarehouseMapPalette()

  const tiles = useMemo(() => {
    const scale = viewTransform.scale || 1
    const pad = MAP_TILE_SIZE * 2

    const minWx = sceneBounds.minX + (-viewTransform.x) / scale - pad
    const maxWx = sceneBounds.minX + (canvasSize.width - viewTransform.x) / scale + pad
    const minWy = sceneBounds.minY + (-viewTransform.y) / scale - pad
    const maxWy = sceneBounds.minY + (canvasSize.height - viewTransform.y) / scale + pad

    const minTx = Math.floor(minWx / MAP_TILE_SIZE)
    const maxTx = Math.floor(maxWx / MAP_TILE_SIZE)
    const minTy = Math.floor(minWy / MAP_TILE_SIZE)
    const maxTy = Math.floor(maxWy / MAP_TILE_SIZE)

    const result = []
    for (let ty = minTy; ty <= maxTy; ty += 1) {
      for (let tx = minTx; tx <= maxTx; tx += 1) {
        result.push({ tx, ty })
      }
    }
    return result
  }, [
    viewTransform.x,
    viewTransform.y,
    viewTransform.scale,
    sceneBounds.minX,
    sceneBounds.minY,
    sceneBounds.maxX,
    sceneBounds.maxY,
    canvasSize.width,
    canvasSize.height,
  ])

  return (
    <VariedTileGrid
      tiles={tiles}
      baseSeed={baseSeed}
      variant={variant}
      idPrefix="3d"
      mapPalette={mapPalette}
    />
  )
}
