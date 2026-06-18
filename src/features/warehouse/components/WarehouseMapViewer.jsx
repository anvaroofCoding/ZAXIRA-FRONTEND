import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SearchIcon from '@mui/icons-material/Search'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import IconButton from '@mui/material/IconButton'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { Transfer2DDetailDialog } from '@/features/warehouse/components/Transfer2DDetailDialog'
import { Warehouse2DMap } from '@/features/warehouse/components/Warehouse2DMap'
import { Warehouse3DMap } from '@/features/warehouse/components/Warehouse3DMap'
import { WarehouseDetailPanel } from '@/features/warehouse/components/WarehouseDetailPanel'
import { useWarehouseMapData } from '@/features/warehouse/hooks/useWarehouseMapData'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const VIEW_MODES = {
  MAP_2D: '2d',
  MAP_3D: '3d',
}

export const WarehouseMapViewer = ({ viewerStructureId = '', embedded = false }) => {
  const fitViewRef = useRef(null)
  const resetLayoutRef = useRef(null)

  const { overviewQuery, transferQuery, warehouses, activeTransferCount } =
    useWarehouseMapData()

  const [viewMode, setViewMode] = useState(VIEW_MODES.MAP_2D)
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

  const handleFitView = () => {
    fitViewRef.current?.()
  }

  const handleResetLayout = () => {
    resetLayoutRef.current?.()
  }

  const canvasHeight = isFullscreen
    ? '100%'
    : embedded
      ? { xs: 460, sm: 540, md: 620 }
      : { xs: 'calc(100vh - 220px)', md: 'calc(100vh - 200px)' }

  const toolbar = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
        flexShrink: 0,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h6" fontWeight={700}>
          Omborlar xaritasi
        </Typography>
        <Typography variant="body2" color="text.secondary">
          2D va 3D rejimda omborlar va transferlarni kuzating.
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
        <ToggleButtonGroup
          size="small"
          exclusive
          value={viewMode}
          onChange={(_event, value) => {
            if (value) setViewMode(value)
          }}
        >
          <ToggleButton value={VIEW_MODES.MAP_2D} aria-label="2D ko'rinish">
            <ViewModuleIcon fontSize="small" sx={{ mr: 0.5 }} />
            2D
          </ToggleButton>
          <ToggleButton value={VIEW_MODES.MAP_3D} aria-label="3D ko'rinish">
            <ViewInArIcon fontSize="small" sx={{ mr: 0.5 }} />
            3D
          </ToggleButton>
        </ToggleButtonGroup>

        <FormControl size="small" sx={{ minWidth: { xs: 160, sm: 220 } }}>
          <InputLabel id="warehouse-map-select-label" shrink>
            Ombor
          </InputLabel>
          <Select
            labelId="warehouse-map-select-label"
            label="Ombor"
            value={selectedWarehouseId || ''}
            onChange={(event) => {
              const nextId = event.target.value
              setSelectedWarehouseId(nextId)
              if (!nextId) {
                setSearchQuery('')
              }
            }}
            displayEmpty
            disabled={!warehouses.length}
            renderValue={(value) => {
              if (!value) return 'Barcha omborlar'
              const entry = warehouseOptions.find((item) => item.structure.id === value)
              if (!entry) return 'Barcha omborlar'
              return `${entry.structure.shortName} (${entry.totalQuantity} ta)`
            }}
          >
            <MenuItem value="">Barcha omborlar</MenuItem>
            {warehouseOptions.map((entry) => (
              <MenuItem key={entry.structure.id} value={entry.structure.id}>
                {entry.structure.shortName} ({entry.totalQuantity} ta)
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          size="small"
          placeholder="Ombor qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          sx={{ width: { xs: 160, sm: 200 } }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />

        <Chip size="small" label={`Omborlar: ${warehouses.length}`} />
        <Chip
          size="small"
          color={activeTransferCount ? 'warning' : 'default'}
          label={`Faol transferlar: ${activeTransferCount}`}
        />

        {isFullscreen ? (
          viewMode === VIEW_MODES.MAP_2D ? (
            <>
              <Tooltip title="Barchasini ko'rish">
                <IconButton
                  size="small"
                  onClick={handleFitView}
                  sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
                >
                  <FilterCenterFocusIcon fontSize="small" />
                </IconButton>
              </Tooltip>
              <Button
                size="small"
                variant="outlined"
                startIcon={<RestartAltIcon />}
                onClick={handleResetLayout}
                disabled={!warehouses.length}
              >
                Joylashuv
              </Button>
            </>
          ) : (
            <Tooltip title="Barchasini ko'rish">
              <IconButton
                size="small"
                onClick={handleFitView}
                sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
              >
                <FilterCenterFocusIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )
        ) : null}

        <Tooltip title={isFullscreen ? 'Kichiklashtirish' : 'Butun ekran'}>
          <IconButton
            size="small"
            onClick={() => setIsFullscreen((prev) => !prev)}
            aria-label={isFullscreen ? 'Kichiklashtirish' : 'Butun ekran'}
            sx={{ border: 1, borderColor: 'divider', borderRadius: 1 }}
          >
            {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>
    </Box>
  )

  const legend = (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', flexShrink: 0 }}>
      <Chip size="small" color="warning" variant="outlined" label="Faol transfer" />
      <Chip size="small" color="success" variant="outlined" label="Yakunlangan" />
      <Chip size="small" color="error" variant="outlined" label="Bekor qilingan" />
      <Chip size="small" variant="outlined" label="Omborni bosing — tafsilot" />
    </Stack>
  )

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
          canvasHeight={canvasHeight}
          hideTransferDialog
          enableViewportControls={isFullscreen}
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
          canvasHeight={canvasHeight}
          hideTransferDialog
          enableViewportControls={isFullscreen}
        />
      )}

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
      spacing={1.5}
      sx={{
        width: '100%',
        minHeight: embedded ? { xs: 500, sm: 580, md: 660 } : 'calc(100vh - 160px)',
        flex: 1,
      }}
    >
      {toolbar}
      {legend}
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
            gap: 1.5,
            p: 2,
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
