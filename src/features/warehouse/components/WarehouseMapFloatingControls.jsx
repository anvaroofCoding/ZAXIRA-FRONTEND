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
import {
  mapControlButtonSx,
  mapControlSurfaceSx,
  YANDEX_MAP,
} from '@/features/warehouse/utils/warehouseMapTheme'

const ControlStack = ({ children, sx }) => (
  <Stack
    spacing={0}
    sx={{
      ...mapControlSurfaceSx,
      overflow: 'hidden',
      ...sx,
    }}
  >
    {children}
  </Stack>
)

const ControlBtn = ({ title, onClick, disabled, active, children }) => (
  <Tooltip title={title} placement="left">
    <span>
      <IconButton
        size="small"
        onClick={onClick}
        disabled={disabled}
        sx={{
          ...mapControlButtonSx,
          borderRadius: 0,
          bgcolor: active ? alpha('#1976d2', 0.12) : 'transparent',
          color: active ? 'primary.main' : YANDEX_MAP.text,
          fontWeight: 700,
          fontSize: '0.7rem',
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
}) => (
  <>
    <Stack
      direction="row"
      spacing={1}
      useFlexGap
      sx={{
        position: 'absolute',
        top: 12,
        left: 12,
        right: 72,
        zIndex: 12,
        flexWrap: 'wrap',
        alignItems: 'center',
        pointerEvents: 'none',
        '& > *': { pointerEvents: 'auto' },
      }}
    >
      <Box
        sx={{
          ...mapControlSurfaceSx,
          display: 'flex',
          alignItems: 'center',
          px: 1.5,
          py: 0.25,
          minWidth: { xs: 160, sm: 220 },
          maxWidth: 280,
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
                  <SearchIcon fontSize="small" sx={{ color: YANDEX_MAP.textMuted }} />
                </InputAdornment>
              ),
              sx: { fontSize: '0.875rem', py: 0.75 },
            },
          }}
        />
      </Box>

      <Box sx={{ ...mapControlSurfaceSx, px: 1, py: 0.25, minWidth: { xs: 140, sm: 180 } }}>
        <FormControl size="small" fullWidth variant="standard">
          <Select
            value={selectedWarehouseId || ''}
            onChange={(e) => onSelectWarehouse(e.target.value)}
            displayEmpty
            disableUnderline
            disabled={!warehouseOptions.length}
            sx={{ fontSize: '0.875rem', py: 0.5 }}
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
          ...mapControlSurfaceSx,
          px: 1.5,
          py: 0.75,
          display: { xs: 'none', sm: 'flex' },
          gap: 1.5,
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
        right: 12,
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 12,
      }}
    >
      <ControlStack>
        <ControlBtn title="Kattalashtirish" onClick={onZoomIn}>
          <AddIcon fontSize="small" />
        </ControlBtn>
        <Divider />
        <ControlBtn title="Kichiklashtirish" onClick={onZoomOut}>
          <RemoveIcon fontSize="small" />
        </ControlBtn>
        <Divider />
        <ControlBtn title="Barchasini ko'rish" onClick={onFitView}>
          <FilterCenterFocusIcon fontSize="small" />
        </ControlBtn>
        {showResetLayout ? (
          <>
            <Divider />
            <ControlBtn title="Joylashuvni tiklash" onClick={onResetLayout}>
              <RestartAltIcon fontSize="small" />
            </ControlBtn>
          </>
        ) : null}
        <Divider />
        <ControlBtn
          title="2D ko'rinish"
          active={viewMode === '2d'}
          onClick={() => onViewModeChange('2d')}
        >
          <ViewModuleIcon fontSize="small" />
        </ControlBtn>
        <Divider />
        <ControlBtn
          title="3D ko'rinish"
          active={viewMode === '3d'}
          onClick={() => onViewModeChange('3d')}
        >
          <ViewInArIcon fontSize="small" />
        </ControlBtn>
        <Divider />
        <ControlBtn
          title={isFullscreen ? 'Kichiklashtirish' : 'Butun ekran'}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? <CloseFullscreenIcon fontSize="small" /> : <FullscreenIcon fontSize="small" />}
        </ControlBtn>
      </ControlStack>
    </Box>

    <Stack
      direction="row"
      spacing={0.75}
      useFlexGap
      sx={{
        position: 'absolute',
        bottom: 12,
        left: 12,
        zIndex: 12,
        flexWrap: 'wrap',
        pointerEvents: 'none',
        '& > *': { pointerEvents: 'auto' },
      }}
    >
      {[
        { color: '#ed6c02', label: 'Faol transfer' },
        { color: '#2e7d32', label: 'Yakunlangan' },
        { color: '#d32f2f', label: 'Bekor' },
      ].map((item) => (
        <Box
          key={item.label}
          sx={{
            ...mapControlSurfaceSx,
            px: 1.25,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
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
