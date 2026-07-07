import AddIcon from '@mui/icons-material/Add'
import CloseFullscreenIcon from '@mui/icons-material/CloseFullscreen'
import FilterCenterFocusIcon from '@mui/icons-material/FilterCenterFocus'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import RemoveIcon from '@mui/icons-material/Remove'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import SearchIcon from '@mui/icons-material/Search'
import ViewInArIcon from '@mui/icons-material/ViewInAr'
import ViewModuleIcon from '@mui/icons-material/ViewModule'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import FormControl from '@mui/material/FormControl'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { alpha } from '@mui/material/styles'
import { useWarehouseMapPalette } from '@/features/warehouse/hooks/useWarehouseMapPalette'
import { WAREHOUSE_DETAIL_PANEL_WIDTH } from '@/features/warehouse/components/WarehouseDetailPanel'

const MAP_EDGE_GAP = 12
const MAP_TOOLBAR_WIDTH = 40
const MAP_TOOLBAR_GAP = 16
const MAP_PILL_HEIGHT = 40

const mapPillSx = (controlSurfaceSx) => ({
  ...controlSurfaceSx,
  height: MAP_PILL_HEIGHT,
  display: 'flex',
  alignItems: 'center',
  boxSizing: 'border-box',
})

const ControlStack = ({ children, surfaceSx, sx }) => (
  <Stack
    spacing={0}
    sx={{
      ...surfaceSx,
      overflow: 'hidden',
      ...sx,
    }}
  >
    {children}
  </Stack>
)

const ControlBtn = ({ title, onClick, disabled, active, children, buttonSx, theme }) => (
  <Tooltip title={title} placement="left">
    <span>
      <IconButton
        onClick={onClick}
        disabled={disabled}
        sx={{
          ...buttonSx,
          borderRadius: 0,
          bgcolor: active ? alpha(theme.palette.primary.main, 0.14) : 'transparent',
          color: active ? 'primary.main' : 'text.primary',
        }}
      >
        {children}
      </IconButton>
    </span>
  </Tooltip>
)

export const WarehouseMapFloatingControls = ({
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  selectedWarehouseId,
  onSelectWarehouse,
  warehouseOptions = [],
  isFullscreen,
  onToggleFullscreen,
  onFitView,
  onResetLayout,
  onZoomIn,
  onZoomOut,
  showResetLayout = false,
  activeTransferCount = 0,
  warehouseCount = 0,
}) => {
  const { palette, theme, controlSurfaceSx, controlButtonSx } = useWarehouseMapPalette()
  const detailPanelOpen = Boolean(selectedWarehouseId)

  const toolbarRight = detailPanelOpen
    ? MAP_EDGE_GAP + WAREHOUSE_DETAIL_PANEL_WIDTH + MAP_TOOLBAR_GAP
    : MAP_EDGE_GAP

  const topBarRight = toolbarRight + MAP_TOOLBAR_WIDTH + MAP_TOOLBAR_GAP

  return (
    <>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          position: 'absolute',
        top: 12,
        left: 12,
        right: topBarRight,
        zIndex: 8,
          flexWrap: 'wrap',
        alignItems: 'center',
        pointerEvents: 'none',
        transition: 'right 0.25s ease',
        '& > *': { pointerEvents: 'auto' },
        }}
      >
        <Box
          sx={{
            ...mapPillSx(controlSurfaceSx),
            flex: '1 1 0',
            minWidth: 0,
            px: 1.5,
          }}
        >
          <TextField
            size="small"
            placeholder="Ombor qidirish..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            variant="standard"
            fullWidth
            slotProps={{
              input: {
                disableUnderline: true,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: palette.textMuted }} />
                  </InputAdornment>
                ),
                sx: { fontSize: '0.875rem', py: 0.75, color: 'text.primary' },
              },
            }}
          />
        </Box>

        <Box
          sx={{
            ...mapPillSx(controlSurfaceSx),
            flex: '1 1 0',
            minWidth: 0,
            px: 1.5,
          }}
        >
          <FormControl size="small" fullWidth variant="standard">
            <Select
              value={selectedWarehouseId || ''}
              onChange={(e) => onSelectWarehouse(e.target.value)}
              displayEmpty
              disableUnderline
              disabled={!warehouseOptions.length}
              sx={{
                fontSize: '0.875rem',
                width: '100%',
                color: 'text.primary',
                '& .MuiSelect-select': {
                  py: 0.75,
                  pl: 0,
                  pr: '28px !important',
                  display: 'flex',
                  alignItems: 'center',
                },
                '& .MuiSelect-icon': {
                  right: 0,
                  color: palette.textMuted,
                },
              }}
            >
              <MenuItem value="">Barcha omborlar</MenuItem>
              {warehouseOptions.map((entry) => (
                <MenuItem key={entry.structure.id} value={entry.structure.id}>
                  {entry.structure.shortName}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        <Box
          sx={{
            ...mapPillSx(controlSurfaceSx),
            flex: '1 1 0',
            minWidth: 0,
            px: 1.5,
            gap: 1.5,
            display: { xs: 'none', sm: 'flex' },
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Omborlar: <strong>{warehouseCount}</strong>
          </Typography>
          <Typography
            variant="caption"
            color={activeTransferCount ? 'warning.main' : 'text.secondary'}
          >
            Faol: <strong>{activeTransferCount}</strong>
          </Typography>
        </Box>
      </Stack>

      <Box
        sx={{
          position: 'absolute',
          right: toolbarRight,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 8,
          transition: 'right 0.25s ease',
        }}
      >
        <ControlStack surfaceSx={controlSurfaceSx}>
          <ControlBtn title="Kattalashtirish" onClick={onZoomIn} buttonSx={controlButtonSx} theme={theme}>
            <AddIcon fontSize="small" />
          </ControlBtn>
          <Divider />
          <ControlBtn title="Kichiklashtirish" onClick={onZoomOut} buttonSx={controlButtonSx} theme={theme}>
            <RemoveIcon fontSize="small" />
          </ControlBtn>
          <Divider />
          <ControlBtn title="Barchasini ko'rish" onClick={onFitView} buttonSx={controlButtonSx} theme={theme}>
            <FilterCenterFocusIcon fontSize="small" />
          </ControlBtn>
          {showResetLayout ? (
            <>
              <Divider />
              <ControlBtn
                title="Joylashuvni tiklash"
                onClick={onResetLayout}
                buttonSx={controlButtonSx}
                theme={theme}
              >
                <RestartAltIcon fontSize="small" />
              </ControlBtn>
            </>
          ) : null}
          <Divider />
          <ControlBtn
            title="2D ko'rinish"
            active={viewMode === '2d'}
            onClick={() => onViewModeChange('2d')}
            buttonSx={controlButtonSx}
            theme={theme}
          >
            <ViewModuleIcon fontSize="small" />
          </ControlBtn>
          <Divider />
          <ControlBtn
            title="3D ko'rinish"
            active={viewMode === '3d'}
            onClick={() => onViewModeChange('3d')}
            buttonSx={controlButtonSx}
            theme={theme}
          >
            <ViewInArIcon fontSize="small" />
          </ControlBtn>
          <Divider />
          <ControlBtn
            title={isFullscreen ? 'Kichiklashtirish' : 'Butun ekran'}
            onClick={onToggleFullscreen}
            buttonSx={controlButtonSx}
            theme={theme}
          >
            {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
          </ControlBtn>
        </ControlStack>
      </Box>

      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          position: 'absolute',
          bottom: 12,
          left: 12,
          right: detailPanelOpen ? MAP_EDGE_GAP + WAREHOUSE_DETAIL_PANEL_WIDTH + MAP_TOOLBAR_GAP : 12,
          zIndex: 8,
          transition: 'right 0.25s ease',
          flexWrap: 'nowrap',
          maxWidth: 480,
          pointerEvents: 'none',
          '& > *': { pointerEvents: 'auto' },
        }}
      >
        {[
          { color: 'warning.main', label: 'Faol transfer' },
          { color: 'success.main', label: 'Yakunlangan' },
          { color: 'error.main', label: 'Bekor' },
        ].map((item) => (
          <Box
            key={item.label}
            sx={{
              ...mapPillSx(controlSurfaceSx),
              flex: '1 1 0',
              minWidth: 0,
              maxWidth: 160,
              px: 1.25,
              justifyContent: 'center',
              gap: 0.75,
            }}
          >
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: item.color }} />
            <Typography variant="caption" color="text.secondary">
              {item.label}
            </Typography>
          </Box>
        ))}
      </Stack>
    </>
  )
}
