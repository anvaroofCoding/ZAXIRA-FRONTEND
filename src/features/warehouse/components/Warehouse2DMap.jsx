import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { getTransfer2DMarkerColor } from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { Transfer2DDetailDialog } from '@/features/warehouse/components/Transfer2DDetailDialog'
import { useWarehouseMapData } from '@/features/warehouse/hooks/useWarehouseMapData'
import {
  adjustDragPosition,
  buildCircularLayout,
  clampNodeToCanvas,
  computeFitViewport,
  getConnectionGeometry,
  getPathBounds,
  isActiveTransfer,
  loadWarehousePositions,
  matchesWarehouseSearch,
  NODE_HEIGHT,
  NODE_WIDTH,
  resolvePositionCollisions,
  saveWarehousePositions,
  zoomViewportAtPoint,
} from '@/features/warehouse/utils/warehouse2dLayout'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const ACTIVE_TRANSFER_DURATION = 32
const COMPLETED_TRANSFER_DURATION = 48
const HIT_SIZE = 44
const CARGO_ICON_SIZE = 22

const ConnectionRope = ({ pathD, transferCount }) => {
  const theme = useTheme()
  const bounds = useMemo(() => getPathBounds(pathD, 8), [pathD])
  const lineMain = theme.palette.primary.main
  const lineDark = theme.palette.primary.dark
  const lineLight = theme.palette.primary.light
  const mid = useMemo(() => {
    if (!pathD) return null
    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathEl.setAttribute('d', pathD)
    try {
      return pathEl.getPointAtLength(pathEl.getTotalLength() / 2)
    } catch {
      return null
    }
  }, [pathD])

  if (!pathD || !bounds.width || !bounds.height) return null

  return (
    <svg
      width={bounds.width}
      height={bounds.height}
      viewBox={`${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`}
      style={{
        position: 'absolute',
        left: bounds.x,
        top: bounds.y,
        overflow: 'visible',
        pointerEvents: 'none',
        zIndex: 1,
      }}
    >
      <path d={pathD} fill="none" stroke={alpha(lineDark, 0.28)} strokeWidth={5} strokeLinecap="round" />
      <path
        d={pathD}
        fill="none"
        stroke={lineDark}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="2 5"
        opacity={0.5}
      />
      <path d={pathD} fill="none" stroke={lineMain} strokeWidth={2} strokeLinecap="round" />
      <path
        d={pathD}
        fill="none"
        stroke={alpha(lineLight, 0.8)}
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeDasharray="8 12"
      />
      {transferCount > 1 && mid ? (
        <>
          <circle cx={mid.x} cy={mid.y} r={10} fill={theme.palette.background.paper} stroke={lineDark} strokeWidth={1} />
          <text
            x={mid.x}
            y={mid.y + 3.5}
            textAnchor="middle"
            fontSize={9}
            fontWeight={700}
            fill={theme.palette.text.primary}
          >
            {transferCount}
          </text>
        </>
      ) : null}
    </svg>
  )
}

const TransferMarker = ({ pathD, transfer, delay, active, reversed, onSelect }) => {
  const theme = useTheme()
  const markerRef = useRef(null)
  const [hovered, setHovered] = useState(false)
  const duration = active ? ACTIVE_TRANSFER_DURATION : COMPLETED_TRANSFER_DURATION

  useEffect(() => {
    if (!pathD) return undefined

    const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path')
    pathEl.setAttribute('d', pathD)
    const totalLength = pathEl.getTotalLength()
    if (!totalLength) return undefined

    let raf = 0
    const tick = (timestamp) => {
      const elapsedSec = timestamp / 1000
      let progress = ((elapsedSec + delay) % duration) / duration
      if (reversed) progress = 1 - progress
      const point = pathEl.getPointAtLength(progress * totalLength)

      if (markerRef.current) {
        markerRef.current.style.transform = `translate3d(${point.x - HIT_SIZE / 2}px, ${point.y - HIT_SIZE / 2}px, 0)`
      }

      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [pathD, delay, duration, reversed])

  const markerColor = getTransfer2DMarkerColor(transfer.status)
  const iconColor = theme.palette[markerColor].dark

  return (
    <Tooltip title={`${transfer.dispatchCode} — bosing`} placement="top">
      <Box
        ref={markerRef}
        onPointerDown={(event) => {
          event.stopPropagation()
          event.preventDefault()
        }}
        onClick={(event) => {
          event.stopPropagation()
          onSelect(transfer.id)
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
        sx={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: HIT_SIZE,
          height: HIT_SIZE,
          zIndex: 6,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          touchAction: 'manipulation',
        }}
      >
        <Box
          sx={{
            width: hovered ? CARGO_ICON_SIZE + 14 : CARGO_ICON_SIZE + 10,
            height: hovered ? CARGO_ICON_SIZE + 14 : CARGO_ICON_SIZE + 10,
            borderRadius: '50%',
            bgcolor: 'background.paper',
            border: '2px solid',
            borderColor: `${markerColor}.main`,
            boxShadow: hovered ? 6 : 3,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'width 0.15s ease, height 0.15s ease, box-shadow 0.15s ease',
            pointerEvents: 'none',
          }}
        >
          <LocalShippingIcon
            sx={{
              fontSize: hovered ? CARGO_ICON_SIZE + 2 : CARGO_ICON_SIZE,
              color: iconColor,
              transition: 'font-size 0.15s ease',
            }}
          />
        </Box>
      </Box>
    </Tooltip>
  )
}

const WarehouseNode = ({
  warehouse,
  position,
  selected,
  highlighted,
  dimmed,
  isViewerWarehouse,
  onDragStart,
  onPointerMove,
  onPointerUp,
  onSelect,
}) => {
  const theme = useTheme()

  const nodeContent = (
    <>
      <WarehouseOutlinedIcon
        sx={{ color: selected ? 'primary.contrastText' : undefined }}
        color={selected ? 'inherit' : 'action'}
      />
      <Typography
        variant="caption"
        fontWeight={700}
        color={selected ? 'primary.contrastText' : 'text.primary'}
        sx={{
          textAlign: 'center',
          lineHeight: 1.2,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {warehouse.structure.shortName}
      </Typography>
      {selected ? (
        <Typography
          variant="caption"
          fontWeight={700}
          color="primary.contrastText"
          sx={{ fontSize: '0.68rem' }}
        >
          {warehouse.totalQuantity} ta
        </Typography>
      ) : (
        <Chip size="small" label={`${warehouse.totalQuantity} ta`} sx={{ height: 20, fontSize: '0.68rem' }} />
      )}
    </>
  )

  return (
    <Box
      onPointerDown={(event) => onDragStart(event, warehouse.structure.id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={(event) => {
        event.stopPropagation()
        onSelect(warehouse.structure.id)
      }}
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        touchAction: 'none',
        cursor: 'grab',
        userSelect: 'none',
        zIndex: selected ? 5 : 4,
        opacity: dimmed ? 0.38 : 1,
        transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Paper
        elevation={selected ? 4 : 1}
        variant="outlined"
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 0.5,
          px: 1,
          borderWidth: selected ? 2 : isViewerWarehouse ? 2 : 1,
          borderColor: selected
            ? 'primary.dark'
            : isViewerWarehouse
              ? 'primary.main'
              : highlighted
                ? 'primary.light'
                : 'divider',
          bgcolor: selected ? 'primary.main' : 'background.paper',
          color: selected ? 'primary.contrastText' : undefined,
          transition: 'box-shadow 0.2s ease, border-color 0.2s ease, background-color 0.2s ease',
          '&:hover': {
            boxShadow: theme.shadows[selected ? 6 : 4],
          },
        }}
      >
        {nodeContent}
      </Paper>
    </Box>
  )
}

export const Warehouse2DMap = ({
  viewerStructureId = '',
  embedded = false,
  searchQuery = '',
  selectedWarehouseId = '',
  onSelectWarehouse,
  selectedTransferId = '',
  onSelectTransfer,
  onFitViewRef,
  onResetLayoutRef,
  canvasHeight: canvasHeightProp,
  hideTransferDialog = false,
  enableViewportControls = false,
}) => {
  const theme = useTheme()
  const canvasRef = useRef(null)
  const dragRef = useRef(null)
  const panRef = useRef(null)
  const prevCanvasSizeRef = useRef(null)

  const { overviewQuery, transferQuery, warehouses, structureIds, buildTransferLinks } =
    useWarehouseMapData()

  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 640 })
  const [positions, setPositions] = useState({})
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 })

  const canvasHeight =
    canvasHeightProp ??
    (embedded ? { xs: 460, sm: 540, md: 620 } : { xs: 'calc(100vh - 220px)', md: 'calc(100vh - 200px)' })

  const searchActive = searchQuery.trim().length > 0

  useLayoutEffect(() => {
    const element = canvasRef.current
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

  useEffect(() => {
    const prev = prevCanvasSizeRef.current
    if (!prev) {
      prevCanvasSizeRef.current = canvasSize
      return
    }

    if (prev.width === canvasSize.width && prev.height === canvasSize.height) return

    const scaleX = canvasSize.width / prev.width
    const scaleY = canvasSize.height / prev.height
    if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) {
      prevCanvasSizeRef.current = canvasSize
      return
    }

    setPositions((current) => {
      if (!Object.keys(current).length) return current

      const next = Object.fromEntries(
        Object.entries(current).map(([id, pos]) => [
          id,
          clampNodeToCanvas(
            {
              x: pos.x * scaleX,
              y: pos.y * scaleY,
            },
            canvasSize.width,
            canvasSize.height,
          ),
        ]),
      )
      const separated = resolvePositionCollisions(
        next,
        Object.keys(next),
        canvasSize.width,
        canvasSize.height,
      )
      saveWarehousePositions(separated)
      return separated
    })

    prevCanvasSizeRef.current = canvasSize
  }, [canvasSize.width, canvasSize.height])

  useEffect(() => {
    if (!structureIds.length) return

    const saved = loadWarehousePositions()
    const hasAllPositions = structureIds.every((id) => saved[id])
    const nextPositions = resolvePositionCollisions(
      hasAllPositions
        ? structureIds.reduce((acc, id) => {
            acc[id] = saved[id]
            return acc
          }, {})
        : buildCircularLayout(structureIds, canvasSize.width, canvasSize.height),
      structureIds,
      canvasSize.width,
      canvasSize.height,
    )

    setPositions(nextPositions)
    if (hasAllPositions) {
      saveWarehousePositions(nextPositions)
    }
  }, [structureIds, canvasSize.width, canvasSize.height])

  const handleFitView = useCallback(() => {
    setViewport(computeFitViewport(positions, canvasSize.width, canvasSize.height))
  }, [positions, canvasSize.width, canvasSize.height])

  const handleResetLayout = useCallback(() => {
    const next = buildCircularLayout(structureIds, canvasSize.width, canvasSize.height)
    setPositions(next)
    saveWarehousePositions(next)
    setViewport(computeFitViewport(next, canvasSize.width, canvasSize.height))
  }, [structureIds, canvasSize.width, canvasSize.height])

  useEffect(() => {
    if (onFitViewRef) onFitViewRef.current = handleFitView
    if (onResetLayoutRef) onResetLayoutRef.current = handleResetLayout
  }, [handleFitView, handleResetLayout, onFitViewRef, onResetLayoutRef])

  useEffect(() => {
    if (!enableViewportControls && Object.keys(positions).length && canvasSize.width > 0) {
      setViewport(computeFitViewport(positions, canvasSize.width, canvasSize.height))
    }
  }, [enableViewportControls, positions, canvasSize.width, canvasSize.height])

  useEffect(() => {
    if (enableViewportControls && Object.keys(positions).length && canvasSize.width > 0) {
      setViewport(computeFitViewport(positions, canvasSize.width, canvasSize.height))
    }
    // Faqat to'liq ekranga o'tganda bir marta moslashtirish
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enableViewportControls])

  const handleDragStart = useCallback(
    (event, structureId) => {
      if (event.button !== 0) return
      const current = positions[structureId]
      if (!current) return

      dragRef.current = {
        structureId,
        startX: event.clientX,
        startY: event.clientY,
        originX: current.x,
        originY: current.y,
        pointerId: event.pointerId,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
      event.stopPropagation()
    },
    [positions],
  )

  const handlePointerMove = useCallback(
    (event) => {
      const drag = dragRef.current
      if (drag?.pointerId === event.pointerId) {
        const dx = (event.clientX - drag.startX) / viewport.scale
        const dy = (event.clientY - drag.startY) / viewport.scale

        setPositions((prev) => {
          const target = adjustDragPosition(
            drag.structureId,
            { x: drag.originX + dx, y: drag.originY + dy },
            prev,
            canvasSize.width,
            canvasSize.height,
          )

          return {
            ...prev,
            [drag.structureId]: target,
          }
        })
        return
      }

      const pan = panRef.current
      if (enableViewportControls && pan?.pointerId === event.pointerId) {
        setViewport((prev) => ({
          ...prev,
          x: pan.originX + (event.clientX - pan.startX),
          y: pan.originY + (event.clientY - pan.startY),
        }))
      }
    },
    [canvasSize.height, canvasSize.width, enableViewportControls, viewport.scale],
  )

  const handlePointerUp = useCallback((event) => {
    const drag = dragRef.current
    if (drag?.pointerId === event.pointerId) {
      dragRef.current = null
      setPositions((prev) => {
        const separated = resolvePositionCollisions(
          prev,
          structureIds,
          canvasSize.width,
          canvasSize.height,
        )
        saveWarehousePositions(separated)
        return separated
      })
    }

    const pan = panRef.current
    if (pan?.pointerId === event.pointerId) {
      panRef.current = null
    }
  }, [canvasSize.height, canvasSize.width, structureIds])

  const handleCanvasPanStart = useCallback(
    (event) => {
      if (!enableViewportControls) return
      if (event.button !== 0 && event.button !== 1) return
      panRef.current = {
        startX: event.clientX,
        startY: event.clientY,
        originX: viewport.x,
        originY: viewport.y,
        pointerId: event.pointerId,
      }
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [enableViewportControls, viewport.x, viewport.y],
  )

  const handleWheel = useCallback(
    (event) => {
      if (!enableViewportControls) return
      event.preventDefault()
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return

      const pointerX = event.clientX - rect.left
      const pointerY = event.clientY - rect.top
      const factor = event.deltaY > 0 ? 0.92 : 1.08

      setViewport((prev) => zoomViewportAtPoint(prev, pointerX, pointerY, factor))
    },
    [enableViewportControls],
  )

  useEffect(() => {
    const element = canvasRef.current
    if (!element || !enableViewportControls) return undefined

    element.addEventListener('wheel', handleWheel, { passive: false })
    return () => element.removeEventListener('wheel', handleWheel)
  }, [enableViewportControls, handleWheel])

  const transferLinks = useMemo(
    () => buildTransferLinks(positions, getConnectionGeometry),
    [buildTransferLinks, positions],
  )

  const transferMarkers = useMemo(
    () => transferLinks.flatMap((link) => link.markers),
    [transferLinks],
  )

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
            bgcolor: alpha(theme.palette.primary.main, 0.02),
            backgroundImage: `
              linear-gradient(${alpha(theme.palette.divider, 0.35)} 1px, transparent 1px),
              linear-gradient(90deg, ${alpha(theme.palette.divider, 0.35)} 1px, transparent 1px)
            `,
            backgroundSize: `${28 * viewport.scale}px ${28 * viewport.scale}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          }}
        >
          <Box
            ref={canvasRef}
            onPointerDown={enableViewportControls ? handleCanvasPanStart : undefined}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
              cursor: enableViewportControls ? 'grab' : 'default',
              touchAction: enableViewportControls ? 'none' : 'auto',
              '&:active': enableViewportControls ? { cursor: 'grabbing' } : undefined,
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.scale})`,
                transformOrigin: '0 0',
              }}
            >
              {transferLinks.map(({ key, geometry, transferCount }) => (
                <ConnectionRope key={key} pathD={geometry.pathD} transferCount={transferCount} />
              ))}

              {transferMarkers.map(({ transfer, pathD, delay, reversed }) => (
                <TransferMarker
                  key={transfer.id}
                  pathD={pathD}
                  transfer={transfer}
                  delay={delay}
                  reversed={reversed}
                  active={isActiveTransfer(transfer)}
                  onSelect={onSelectTransfer}
                />
              ))}

              {warehouses.map((warehouse) => {
                const position = positions[warehouse.structure.id]
                if (!position) return null

                const id = warehouse.structure.id
                const highlighted = matchesWarehouseSearch(warehouse, searchQuery)
                const dimmed = searchActive && !highlighted

                return (
                  <WarehouseNode
                    key={id}
                    warehouse={warehouse}
                    position={position}
                    selected={selectedWarehouseId === id}
                    highlighted={highlighted && selectedWarehouseId !== id}
                    dimmed={dimmed}
                    isViewerWarehouse={viewerStructureId === id}
                    onDragStart={handleDragStart}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onSelect={onSelectWarehouse}
                  />
                )
              })}
            </Box>

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
                  zIndex: 7,
                  pointerEvents: 'none',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Zoom: {Math.round(viewport.scale * 100)}% · Bo&apos;sh joyni sudrab ko&apos;chiring · Omborni
                  sudrab joylashtiring
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
