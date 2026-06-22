import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Transfer2DDetailDialog } from '@/features/warehouse/components/Transfer2DDetailDialog'
import { Warehouse2DMap } from '@/features/warehouse/components/Warehouse2DMap'
import { Warehouse3DMap } from '@/features/warehouse/components/Warehouse3DMap'
import { WarehouseDetailPanel } from '@/features/warehouse/components/WarehouseDetailPanel'
import { WarehouseMapFloatingControls } from '@/features/warehouse/components/WarehouseMapFloatingControls'
import { useWarehouseMapData } from '@/features/warehouse/hooks/useWarehouseMapData'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const VIEW_MODES = {
  MAP_2D: '2d',
  MAP_3D: '3d',
}

export const WarehouseMapViewer = ({ viewerStructureId = '', embedded = false }) => {
  const fitViewRef = useRef(null)
  const resetLayoutRef = useRef(null)
  const zoomInRef = useRef(null)
  const zoomOutRef = useRef(null)

  const { overviewQuery, transferQuery, warehouses, activeTransferCount } =
    useWarehouseMapData()

  const [viewMode, setViewMode] = useState(VIEW_MODES.MAP_3D)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('')
  const [selectedTransferId, setSelectedTransferId] = useState('')

  const selectedWarehouse = useMemo(
    () => warehouses.find((w) => w.structure.id === selectedWarehouseId) ?? null,
    [warehouses, selectedWarehouseId],
  )

  const warehouseOptions = useMemo(
    () =>
      [...warehouses].sort((a, b) =>
        a.structure.shortName.localeCompare(b.structure.shortName, 'uz'),
      ),
    [warehouses],
  )

  useEffect(() => {
    if (!isFullscreen) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isFullscreen])

  const handleSelectWarehouse = useCallback((id) => {
    setSelectedWarehouseId((prev) => (prev === id ? '' : id))
  }, [])

  const handleSelectTransfer = useCallback((id) => {
    setSelectedTransferId(id)
  }, [])

  const handleWarehouseSelectFromDropdown = useCallback((id) => {
    setSelectedWarehouseId(id)
    if (!id) setSearchQuery('')
  }, [])

  const handleFitView = () => {
    fitViewRef.current?.()
  }

  const handleResetLayout = () => {
    resetLayoutRef.current?.()
  }

  const handleZoomIn = () => {
    zoomInRef.current?.()
  }

  const handleZoomOut = () => {
    zoomOutRef.current?.()
  }

  const canvasHeight = isFullscreen
    ? '100%'
    : embedded
      ? { xs: 460, sm: 540, md: 620 }
      : { xs: 'calc(100vh - 220px)', md: 'calc(100vh - 200px)' }

  const mapArea = (
    <Box sx={{ position: 'relative', flex: 1, minHeight: 0, display: 'flex' }}>
      {viewMode === VIEW_MODES.MAP_2D ? (
        <Warehouse2DMap
          viewerStructureId={viewerStructureId}
          embedded={embedded}
          searchQuery={searchQuery}
          selectedWarehouseId={selectedWarehouseId}
          onSelectWarehouse={handleSelectWarehouse}
          selectedTransferId={selectedTransferId}
          onSelectTransfer={handleSelectTransfer}
          onFitViewRef={fitViewRef}
          onResetLayoutRef={resetLayoutRef}
          onZoomInRef={zoomInRef}
          onZoomOutRef={zoomOutRef}
          canvasHeight={canvasHeight}
          hideTransferDialog
          enableViewportControls
        />
      ) : (
        <Warehouse3DMap
          viewerStructureId={viewerStructureId}
          embedded={embedded}
          searchQuery={searchQuery}
          selectedWarehouseId={selectedWarehouseId}
          onSelectWarehouse={handleSelectWarehouse}
          selectedTransferId={selectedTransferId}
          onSelectTransfer={handleSelectTransfer}
          onFitViewRef={fitViewRef}
          onZoomInRef={zoomInRef}
          onZoomOutRef={zoomOutRef}
          canvasHeight={canvasHeight}
          hideTransferDialog
          enableViewportControls
        />
      )}

      <WarehouseMapFloatingControls
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedWarehouseId={selectedWarehouseId}
        onSelectWarehouse={handleWarehouseSelectFromDropdown}
        warehouseOptions={warehouseOptions}
        isFullscreen={isFullscreen}
        onToggleFullscreen={() => setIsFullscreen((prev) => !prev)}
        onFitView={handleFitView}
        onResetLayout={handleResetLayout}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        showResetLayout={viewMode === VIEW_MODES.MAP_2D}
        activeTransferCount={activeTransferCount}
        warehouseCount={warehouses.length}
      />

      <WarehouseDetailPanel
        warehouse={selectedWarehouse}
        viewerStructureId={viewerStructureId}
        onClose={() => setSelectedWarehouseId('')}
      />
    </Box>
  )

  const alerts = (
    <>
      {overviewQuery.isError ? (
        <Alert severity="error">
          {getApiErrorMessage(overviewQuery.error, 'Omborlarni yuklashda xatolik')}
        </Alert>
      ) : null}
      {transferQuery.isError ? (
        <Alert severity="warning">
          {getApiErrorMessage(transferQuery.error, 'Transferlarni yuklashda xatolik')}
        </Alert>
      ) : null}
    </>
  )

  const content = (
    <Stack
      spacing={embedded ? 0 : 1}
      sx={{
        width: '100%',
        minHeight: embedded ? { xs: 500, sm: 580, md: 660 } : 'calc(100vh - 160px)',
        flex: 1,
      }}
    >
      {!embedded ? (
        <Typography variant="h6" fontWeight={700} sx={{ flexShrink: 0, px: 0.5 }}>
          Omborlar xaritasi
        </Typography>
      ) : null}
      {mapArea}
      {alerts}
    </Stack>
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
            gap: 1,
            p: 1.5,
          }}
        >
          {content}
        </Box>
      ) : (
        content
      )}

      <Transfer2DDetailDialog
        transferId={selectedTransferId}
        viewerStructureId={viewerStructureId}
        onClose={() => setSelectedTransferId('')}
      />
    </>
  )
}
