import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import LocalShippingIcon from '@mui/icons-material/LocalShipping'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import { getTransfer2DMarkerColor } from '@/features/warehouse-dispatches/utils/dispatchStatusDisplay'
import { useGetTransferHistoryQuery } from '@/features/transfer/api/transferApi'
import { useGetAllWarehousesOverviewQuery } from '@/features/warehouse/api/warehouseApi'
import { Transfer2DDetailDialog } from '@/features/warehouse/components/Transfer2DDetailDialog'
import {
  buildCircularLayout,
  buildTransferLinkPairs,
  getConnectionGeometry,
  getPathBounds,
  getTransferEndpointIds,
  isActiveTransfer,
  loadWarehousePositions,
  NODE_HEIGHT,
  NODE_WIDTH,
  saveWarehousePositions,
} from '@/features/warehouse/utils/warehouse2dLayout'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const TRANSFER_FETCH_LIMIT = 200
const ACTIVE_TRANSFER_DURATION = 32
const COMPLETED_TRANSFER_DURATION = 48
const HIT_SIZE = 44
const CARGO_ICON_SIZE = 22

const ConnectionRope = ({ pathD }) => {
  const theme = useTheme()
  const bounds = useMemo(() => getPathBounds(pathD, 8), [pathD])
  const lineMain = theme.palette.primary.main
  const lineDark = theme.palette.primary.dark
  const lineLight = theme.palette.primary.light

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
      <path
        d={pathD}
        fill="none"
        stroke={alpha(lineDark, 0.28)}
        strokeWidth={5}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        fill="none"
        stroke={lineDark}
        strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray="2 5"
        opacity={0.5}
      />
      <path
        d={pathD}
        fill="none"
        stroke={lineMain}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path
        d={pathD}
        fill="none"
        stroke={alpha(lineLight, 0.8)}
        strokeWidth={0.8}
        strokeLinecap="round"
        strokeDasharray="8 12"
      />
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
  onDragStart,
  onPointerMove,
  onPointerUp,
}) => {
  const theme = useTheme()

  return (
    <Box
      onPointerDown={(event) => onDragStart(event, warehouse.structure.id)}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      sx={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: NODE_WIDTH,
        height: NODE_HEIGHT,
        touchAction: 'none',
        cursor: 'grab',
        userSelect: 'none',
        zIndex: 4,
        '&:active': { cursor: 'grabbing' },
      }}
    >
      <Paper
        elevation={1}
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
          borderWidth: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
          transition: 'box-shadow 0.2s ease',
          '&:hover': {
            boxShadow: theme.shadows[4],
          },
        }}
      >
        <WarehouseOutlinedIcon color="action" />
        <Typography
          variant="caption"
          fontWeight={700}
          textAlign="center"
          sx={{
            lineHeight: 1.2,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {warehouse.structure.shortName}
        </Typography>
        <Chip
          size="small"
          label={`${warehouse.totalQuantity} ta`}
          sx={{ height: 20, fontSize: '0.68rem' }}
        />
      </Paper>
    </Box>
  )
}

export const Warehouse2DMap = ({ viewerStructureId = '' }) => {
  const theme = useTheme()
  const canvasRef = useRef(null)
  const dragRef = useRef(null)
  const prevCanvasSizeRef = useRef(null)

  const overviewQuery = useGetAllWarehousesOverviewQuery()
  const transferQuery = useGetTransferHistoryQuery({
    page: 1,
    limit: TRANSFER_FETCH_LIMIT,
  })

  const warehouses = overviewQuery.data ?? []
  const transfers = transferQuery.data?.items ?? []
  const structureIds = useMemo(
    () => warehouses.map((entry) => entry.structure.id),
    [warehouses],
  )

  const [isFullscreen, setIsFullscreen] = useState(false)
  const [canvasSize, setCanvasSize] = useState({ width: 900, height: 640 })
  const [positions, setPositions] = useState({})
  const [selectedTransferId, setSelectedTransferId] = useState('')

  const canvasHeight = isFullscreen ? '100%' : { xs: 'calc(100vh - 220px)', md: 'calc(100vh - 200px)' }

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
  }, [isFullscreen])

  useEffect(() => {
    const prev = prevCanvasSizeRef.current
    if (!prev) {
      prevCanvasSizeRef.current = canvasSize
      return
    }

    if (prev.width === canvasSize.width && prev.height === canvasSize.height) {
      return
    }

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
          {
            x: Math.max(8, Math.min(canvasSize.width - NODE_WIDTH - 8, pos.x * scaleX)),
            y: Math.max(8, Math.min(canvasSize.height - NODE_HEIGHT - 8, pos.y * scaleY)),
          },
        ]),
      )
      saveWarehousePositions(next)
      return next
    })

    prevCanvasSizeRef.current = canvasSize
  }, [canvasSize.width, canvasSize.height])

  useEffect(() => {
    if (!isFullscreen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isFullscreen])

  useEffect(() => {
    if (!structureIds.length) return

    const saved = loadWarehousePositions()
    const hasAllPositions = structureIds.every((id) => saved[id])
    if (hasAllPositions) {
      setPositions(
        structureIds.reduce((acc, id) => {
          acc[id] = saved[id]
          return acc
        }, {}),
      )
      return
    }

    setPositions(buildCircularLayout(structureIds, canvasSize.width, canvasSize.height))
  }, [structureIds, canvasSize.width, canvasSize.height])

  const handleDragStart = useCallback((event, structureId) => {
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
  }, [positions])

  const handlePointerMove = useCallback((event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    const dx = event.clientX - drag.startX
    const dy = event.clientY - drag.startY
    const nextX = Math.max(8, Math.min(canvasSize.width - NODE_WIDTH - 8, drag.originX + dx))
    const nextY = Math.max(8, Math.min(canvasSize.height - NODE_HEIGHT - 8, drag.originY + dy))

    setPositions((prev) => ({
      ...prev,
      [drag.structureId]: { x: nextX, y: nextY },
    }))
  }, [canvasSize.height, canvasSize.width])

  const handlePointerUp = useCallback((event) => {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return

    dragRef.current = null
    setPositions((prev) => {
      saveWarehousePositions(prev)
      return prev
    })
  }, [])

  const handleResetLayout = () => {
    const next = buildCircularLayout(structureIds, canvasSize.width, canvasSize.height)
    setPositions(next)
    saveWarehousePositions(next)
  }

  const transferLinks = useMemo(() => {
    return buildTransferLinkPairs(structureIds, transfers)
      .map((pair) => {
        const fromPos = positions[pair.fromId]
        const toPos = positions[pair.toId]
        if (!fromPos || !toPos) return null

        const geometry = getConnectionGeometry(fromPos, toPos)
        const markers = pair.transfers
          .map((transfer, index) => {
            const { fromId, toId } = getTransferEndpointIds(transfer)
            const reversed = fromId !== pair.fromId || toId !== pair.toId

            return {
              transfer,
              pathD: geometry.pathD,
              reversed,
              delay: index * 4,
            }
          })
          .filter(Boolean)

        return {
          key: `${pair.fromId}-${pair.toId}`,
          geometry,
          markers,
        }
      })
      .filter(Boolean)
  }, [structureIds, transfers, positions])

  const transferMarkers = useMemo(
    () => transferLinks.flatMap((link) => link.markers),
    [transferLinks],
  )

  const activeTransferCount = transfers.filter(isActiveTransfer).length

  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      <Box>
        <Typography variant="h6" fontWeight={700}>
          2D Omborlar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Omborlarni sudrab joylashtiring. Transfer bo&apos;lgan omborlar arqon bilan bog&apos;lanadi.
        </Typography>
      </Box>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <Chip size="small" label={`Omborlar: ${warehouses.length}`} />
        <Chip
          size="small"
          color={activeTransferCount ? 'warning' : 'default'}
          label={`Faol transferlar: ${activeTransferCount}`}
        />
        <Button
          size="small"
          variant="outlined"
          startIcon={<RestartAltIcon />}
          onClick={handleResetLayout}
          disabled={!structureIds.length}
        >
          Joylashuvni tiklash
        </Button>
        <Tooltip title={isFullscreen ? 'Kichiklashtirish' : 'Butun ekran'}>
          <IconButton
            size="small"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-label={isFullscreen ? 'Kichiklashtirish' : 'Butun ekran'}
            sx={{
              border: 1,
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
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
            backgroundSize: '28px 28px',
          }}
        >
          <Box
            ref={canvasRef}
            sx={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            {transferLinks.map(({ key, geometry }) => (
              <ConnectionRope key={key} pathD={geometry.pathD} />
            ))}

            {transferMarkers.map(({ transfer, pathD, delay, reversed }) => (
              <TransferMarker
                key={transfer.id}
                pathD={pathD}
                transfer={transfer}
                delay={delay}
                reversed={reversed}
                active={isActiveTransfer(transfer)}
                onSelect={setSelectedTransferId}
              />
            ))}

            {warehouses.map((warehouse) => {
              const position = positions[warehouse.structure.id]
              if (!position) return null

              return (
                <WarehouseNode
                  key={warehouse.structure.id}
                  warehouse={warehouse}
                  position={position}
                  onDragStart={handleDragStart}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                />
              )
            })}
          </Box>
        </Paper>
      )}
    </QuerySkeleton>
  )

  return (
    <>
      {isFullscreen ? (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: (t) => t.zIndex.drawer + 20,
            bgcolor: 'background.default',
            display: 'flex',
            flexDirection: 'column',
            gap: 1.5,
            p: 2,
          }}
        >
          {toolbar}
          {mapContent}
          {transferQuery.isError ? (
            <Alert severity="warning" sx={{ flexShrink: 0 }}>
              {getApiErrorMessage(transferQuery.error, 'Transferlarni yuklashda xatolik')}
            </Alert>
          ) : null}
        </Box>
      ) : (
        <Stack spacing={2} sx={{ width: '100%', minHeight: 'calc(100vh - 160px)' }}>
          {toolbar}
          {mapContent}
          {transferQuery.isError ? (
            <Alert severity="warning">
              {getApiErrorMessage(transferQuery.error, 'Transferlarni yuklashda xatolik')}
            </Alert>
          ) : null}
        </Stack>
      )}

      <Transfer2DDetailDialog
        transferId={selectedTransferId}
        viewerStructureId={viewerStructureId}
        onClose={() => setSelectedTransferId('')}
      />
    </>
  )
}
