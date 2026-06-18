import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { getTransfer2DMarkerColor } from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { Transfer2DDetailDialog } from '@/features/warehouse/components/Transfer2DDetailDialog'
import { useWarehouseMapData } from '@/features/warehouse/hooks/useWarehouseMapData'
import { isActiveTransfer, matchesWarehouseSearch, buildTransferLinkPairs, getTransferEndpointIds } from '@/features/warehouse/utils/warehouse2dLayout'
import {
  BUILDING_DEPTH,
  BUILDING_WIDTH,
  buildWarehouseGrid3D,
  getBuildingHeight,
  getIsoBoxFaces,
  getIsoConnectionPath,
  getSceneBounds,
  GRID_SPACING,
  worldToIso,
} from '@/features/warehouse/utils/warehouse3dLayout'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const MIN_VIEW_SCALE = 0.35
const MAX_VIEW_SCALE = 2.5
const ACTIVE_TRANSFER_DURATION = 32
const COMPLETED_TRANSFER_DURATION = 48

const clampViewScale = (value) => Math.min(MAX_VIEW_SCALE, Math.max(MIN_VIEW_SCALE, value))

const IsoTransferMarker = ({ pathD, transfer, delay, active, reversed, onSelect }) => {
  const theme = useTheme()
  const markerRef = useRef(null)
  const duration = active ? ACTIVE_TRANSFER_DURATION : COMPLETED_TRANSFER_DURATION
  const markerColor = getTransfer2DMarkerColor(transfer.status)

  useEffect(() => {
    if (!pathD) return undefined

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathEl.setAttribute('d', pathD)
    const totalLength = pathEl.getTotalLength()
    if (!totalLength) return undefined

    let raf = 0
    const tick = (timestamp) => {
      let progress = ((timestamp / 1000 + delay) % duration) / duration
      if (reversed) progress = 1 - progress
      const point = pathEl.getPointAtLength(progress * totalLength)

      if (markerRef.current) {
        markerRef.current.setAttribute('transform', `translate(${point.x - 11}, ${point.y - 11})`)
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pathD, delay, duration, reversed])

  return (
    <g
      ref={markerRef}
      style={{ cursor: 'pointer' }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(transfer.id)
      }}
    >
      <title>{`${transfer.dispatchCode} — bosing`}</title>
      <circle r={10} cx={10} cy={10} fill={theme.palette.background.paper} stroke={theme.palette[markerColor].main} strokeWidth={2} />
      <circle r={4} cx={10} cy={10} fill={theme.palette[markerColor].main} />
    </g>
  )
}

const IsoBuilding = ({
  warehouse,
  position,
  height,
  selected,
  highlighted,
  dimmed,
  onSelect,
}) => {
  const theme = useTheme()
  const cx = position.x + BUILDING_WIDTH / 2
  const cy = position.y + BUILDING_DEPTH / 2
  const faces = getIsoBoxFaces(cx, cy, BUILDING_WIDTH, BUILDING_DEPTH, height)

  const stroke = selected ? theme.palette.primary.dark : alpha(theme.palette.divider, 0.6)
  const strokeWidth = selected ? 1.2 : 0.6

  const topFill = selected
    ? theme.palette.primary.main
    : highlighted
      ? theme.palette.primary.light
      : alpha(theme.palette.primary.main, 0.55)
  const leftFill = selected
    ? theme.palette.primary.dark
    : alpha(theme.palette.primary.dark, dimmed ? 0.25 : 0.65)
  const rightFill = selected
    ? theme.palette.primary.main
    : alpha(theme.palette.primary.main, dimmed ? 0.2 : 0.45)
  const labelFill = theme.palette.getContrastText(topFill)
  const quantityFill = selected ? theme.palette.primary.contrastText : theme.palette.text.secondary
  const opacity = dimmed ? 0.35 : 1

  return (
    <g
      style={{ cursor: 'pointer', opacity }}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(warehouse.structure.id)
      }}
    >
      <polygon points={faces.left} fill={leftFill} stroke={stroke} strokeWidth={strokeWidth} />
      <polygon points={faces.right} fill={rightFill} stroke={stroke} strokeWidth={strokeWidth} />
      <polygon points={faces.top} fill={topFill} stroke={stroke} strokeWidth={selected ? 1.6 : 0.8} />

      <text
        x={faces.center.x}
        y={faces.center.y + 4}
        textAnchor="middle"
        fontSize={11}
        fontWeight={700}
        fill={labelFill}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {warehouse.structure.shortName.length > 10
          ? `${warehouse.structure.shortName.slice(0, 9)}…`
          : warehouse.structure.shortName}
      </text>
      <text
        x={faces.baseCenter.x}
        y={faces.baseCenter.y + 14}
        textAnchor="middle"
        fontSize={10}
        fill={quantityFill}
        style={{ pointerEvents: 'none', userSelect: 'none' }}
      >
        {warehouse.totalQuantity} ta
      </text>
    </g>
  )
}

export const Warehouse3DMap = ({
  viewerStructureId = '',
  embedded = false,
  searchQuery = '',
  selectedWarehouseId = '',
  onSelectWarehouse,
  selectedTransferId = '',
  onSelectTransfer,
  onFitViewRef,
  canvasHeight: canvasHeightProp,
  hideTransferDialog = false,
  enableViewportControls = false,
}) => {
  const theme = useTheme()
  const containerRef = useRef(null)
  const panRef = useRef(null)

  const {
    overviewQuery,
    transferQuery,
    warehouses,
    transfers,
    structureIds,
    maxTotalQuantity,
  } = useWarehouseMapData()

  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 640 })
  const [viewTransform, setViewTransform] = useState({ scale: 1, x: 0, y: 0 })

  const canvasHeight =
    canvasHeightProp ??
    (embedded ? { xs: 460, sm: 540, md: 620 } : { xs: 'calc(100vh - 220px)', md: 'calc(100vh - 200px)' })

  const { positions: gridPositions, bounds: gridBounds } = useMemo(
    () => buildWarehouseGrid3D(structureIds),
    [structureIds],
  )

  const buildingHeights = useMemo(
    () =>
      warehouses.reduce((acc, w) => {
        acc[w.structure.id] = getBuildingHeight(w.totalQuantity, maxTotalQuantity)
        return acc
      }, {}),
    [warehouses, maxTotalQuantity],
  )

  const sceneBounds = useMemo(
    () => getSceneBounds(structureIds, gridPositions, buildingHeights),
    [structureIds, gridPositions, buildingHeights],
  )

  const transferLinks = useMemo(
    () =>
      buildTransferLinkPairs(structureIds, transfers)
        .map((pair) => {
          const fromPos = gridPositions[pair.fromId]
          const toPos = gridPositions[pair.toId]
          if (!fromPos || !toPos) return null

          const pathD = getIsoConnectionPath(
            { x: fromPos.x + BUILDING_WIDTH / 2, y: fromPos.y + BUILDING_DEPTH / 2 },
            { x: toPos.x + BUILDING_WIDTH / 2, y: toPos.y + BUILDING_DEPTH / 2 },
            buildingHeights[pair.fromId] ?? 40,
            buildingHeights[pair.toId] ?? 40,
          )

          const markers = pair.transfers.map((transfer, index) => {
            const { fromId, toId } = getTransferEndpointIds(transfer)
            const reversed = fromId !== pair.fromId || toId !== pair.toId
            return { transfer, pathD, reversed, delay: index * 4 }
          })

          return {
            key: `${pair.fromId}-${pair.toId}`,
            geometry: { pathD },
            transferCount: pair.transfers.length,
            markers,
          }
        })
        .filter(Boolean),
    [structureIds, transfers, gridPositions, buildingHeights],
  )

  const transferMarkers = useMemo(
    () => transferLinks.flatMap((link) => link.markers),
    [transferLinks],
  )

  useLayoutEffect(() => {
    const element = containerRef.current
    if (!element) return undefined

    const updateSize = () => {
      const { width, height } = element.getBoundingClientRect()
      if (width < 1 || height < 1) return
      setCanvasSize({ width, height })
    }

    updateSize()
    const observer = new ResizeObserver(() => updateSize())
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const applyFitView = useCallback(() => {
    const sceneW = sceneBounds.maxX - sceneBounds.minX
    const sceneH = sceneBounds.maxY - sceneBounds.minY
    if (sceneW < 1 || sceneH < 1 || canvasSize.width < 1) return

    const scale = clampViewScale(
      Math.min((canvasSize.width - 80) / sceneW, (canvasSize.height - 80) / sceneH),
    )
    const x = (canvasSize.width - sceneW * scale) / 2
    const y = (canvasSize.height - sceneH * scale) / 2
    setViewTransform({ scale, x, y })
  }, [sceneBounds, canvasSize.width, canvasSize.height])

  useEffect(() => {
    if (!enableViewportControls) {
      applyFitView()
    }
  }, [enableViewportControls, applyFitView, sceneBounds, canvasSize.width, canvasSize.height, structureIds.length])

  useEffect(() => {
    if (enableViewportControls) {
      applyFitView()
    }
  }, [enableViewportControls, applyFitView])

  useEffect(() => {
    if (onFitViewRef) onFitViewRef.current = applyFitView
  }, [applyFitView, onFitViewRef])

  const handleWheel = useCallback(
    (event) => {
      if (!enableViewportControls) return
      event.preventDefault()
      const rect = containerRef.current?.getBoundingClientRect()
      if (!rect) return

      const pointerX = event.clientX - rect.left
      const pointerY = event.clientY - rect.top
      const factor = event.deltaY > 0 ? 0.92 : 1.08

      setViewTransform((prev) => {
        const nextScale = clampViewScale(prev.scale * factor)
        const ratio = nextScale / prev.scale
        return {
          scale: nextScale,
          x: pointerX - (pointerX - prev.x) * ratio,
          y: pointerY - (pointerY - prev.y) * ratio,
        }
      })
    },
    [enableViewportControls],
  )

  useEffect(() => {
    const element = containerRef.current
    if (!element || !enableViewportControls) return undefined

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [enableViewportControls, handleWheel])

  const handlePanStart = useCallback(
    (event) => {
      if (!enableViewportControls) return
      if (event.button !== 0 && event.button !== 1) return
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      originX: viewTransform.x,
      originY: viewTransform.y,
      pointerId: event.pointerId,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [enableViewportControls, viewTransform.x, viewTransform.y])

  const handlePanMove = useCallback((event) => {
    const pan = panRef.current
    if (!pan || pan.pointerId !== event.pointerId) return

    setViewTransform((prev) => ({
      ...prev,
      x: pan.originX + (event.clientX - pan.startX),
      y: pan.originY + (event.clientY - pan.startY),
    }))
  }, [])

  const handlePanEnd = useCallback((event) => {
    const pan = panRef.current
    if (!pan || pan.pointerId !== event.pointerId) return
    panRef.current = null
  }, [])

  const searchActive = searchQuery.trim().length > 0
  const svgViewBox = `0 0 ${canvasSize.width} ${canvasSize.height}`

  const mapContent = (
    <QuerySkeleton
      isLoading={overviewQuery.isLoading}
      isFetching={overviewQuery.isFetching}
      isUninitialized={overviewQuery.isUninitialized}
      data={overviewQuery.data}
    >
      {overviewQuery.isError ? (
        <Alert severity="error">
          {getApiErrorMessage(overviewQuery.error, 'Omborlarni yuklashda xatolik')}
        </Alert>
      ) : !warehouses.length ? (
        <Alert severity="info">Hozircha omborlar topilmadi.</Alert>
      ) : (
        <Paper
          variant="outlined"
          sx={{
            position: 'relative',
            overflow: 'hidden',
            flex: 1,
            minHeight: 0,
            height: canvasHeight,
            bgcolor: alpha(theme.palette.primary.main, 0.03),
            backgroundImage: `
              radial-gradient(${alpha(theme.palette.primary.main, 0.06)} 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        >
          <Box
            ref={containerRef}
            onPointerDown={enableViewportControls ? handlePanStart : undefined}
            onPointerMove={enableViewportControls ? handlePanMove : undefined}
            onPointerUp={enableViewportControls ? handlePanEnd : undefined}
            onPointerCancel={enableViewportControls ? handlePanEnd : undefined}
            sx={{
              width: '100%',
              height: '100%',
              cursor: enableViewportControls ? 'grab' : 'default',
              touchAction: enableViewportControls ? 'none' : 'auto',
              '&:active': enableViewportControls ? { cursor: 'grabbing' } : undefined,
            }}
          >
            <svg width="100%" height="100%" viewBox={svgViewBox} style={{ display: 'block' }}>
              <defs>
                <filter id="iso-shadow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodOpacity="0.15" />
                </filter>
              </defs>

              <g
                transform={`translate(${viewTransform.x}, ${viewTransform.y}) scale(${viewTransform.scale}) translate(${-sceneBounds.minX}, ${-sceneBounds.minY})`}
              >
                {Array.from({ length: gridBounds.cols + 1 }).map((_, i) => {
                  const x = i * GRID_SPACING
                  const start = worldToIso(x, 0, 0)
                  const end = worldToIso(x, gridBounds.rows * GRID_SPACING, 0)
                  return (
                    <line
                      key={`v-${i}`}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={alpha(theme.palette.divider, 0.35)}
                      strokeWidth={0.5}
                    />
                  )
                })}
                {Array.from({ length: gridBounds.rows + 1 }).map((_, i) => {
                  const y = i * GRID_SPACING
                  const start = worldToIso(0, y, 0)
                  const end = worldToIso(gridBounds.cols * GRID_SPACING, y, 0)
                  return (
                    <line
                      key={`h-${i}`}
                      x1={start.x}
                      y1={start.y}
                      x2={end.x}
                      y2={end.y}
                      stroke={alpha(theme.palette.divider, 0.35)}
                      strokeWidth={0.5}
                    />
                  )
                })}

                {transferLinks.map(({ key, geometry, transferCount }) => (
                  <g key={key}>
                    <path
                      d={geometry.pathD}
                      fill="none"
                      stroke={alpha(theme.palette.primary.dark, 0.35)}
                      strokeWidth={4}
                      strokeLinecap="round"
                    />
                    <path
                      d={geometry.pathD}
                      fill="none"
                      stroke={theme.palette.primary.main}
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeDasharray="4 6"
                    />
                    {transferCount > 1 ? (
                      <text
                        x={geometry.pathD.match(/Q ([\d.-]+)/)?.[1] ?? 0}
                        y={geometry.pathD.match(/Q [\d.-]+ ([\d.-]+)/)?.[1] ?? 0}
                        textAnchor="middle"
                        fontSize={9}
                        fill={theme.palette.text.secondary}
                      >
                        {transferCount}
                      </text>
                    ) : null}
                  </g>
                ))}

                {warehouses.map((warehouse) => {
                  const id = warehouse.structure.id
                  const position = gridPositions[id]
                  if (!position) return null

                  const highlighted = matchesWarehouseSearch(warehouse, searchQuery)
                  const dimmed = searchActive && !highlighted
                  const selected = selectedWarehouseId === id
                  const isViewer = viewerStructureId === id

                  return (
                    <g key={id} filter="url(#iso-shadow)">
                      <IsoBuilding
                        warehouse={warehouse}
                        position={position}
                        height={buildingHeights[id]}
                        selected={selected || isViewer}
                        highlighted={highlighted && !selected}
                        dimmed={dimmed}
                        onSelect={onSelectWarehouse}
                      />
                    </g>
                  )
                })}

                {transferMarkers.map(({ transfer, pathD, delay, reversed }) => (
                  <IsoTransferMarker
                    key={transfer.id}
                    pathD={pathD}
                    transfer={transfer}
                    delay={delay}
                    reversed={reversed}
                    active={isActiveTransfer(transfer)}
                    onSelect={onSelectTransfer}
                  />
                ))}
              </g>
            </svg>

            {enableViewportControls ? (
              <Box
                sx={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: alpha(theme.palette.background.paper, 0.92),
                  border: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Zoom: {Math.round(viewTransform.scale * 100)}% · Sudrab ko&apos;chiring · G&apos;ildirak bilan
                  kattalashtiring
                </Typography>
              </Box>
            ) : null}
          </Box>
        </Paper>
      )}
    </QuerySkeleton>
  )

  return (
    <>
      {mapContent}
      {transferQuery.isError ? (
        <Alert severity="warning" sx={{ mt: 1 }}>
          {getApiErrorMessage(transferQuery.error, 'Transferlarni yuklashda xatolik')}
        </Alert>
      ) : null}
      {!hideTransferDialog ? (
        <Transfer2DDetailDialog
          transferId={selectedTransferId}
          viewerStructureId={viewerStructureId}
          onClose={() => onSelectTransfer('')}
        />
      ) : null}
    </>
  )
}
