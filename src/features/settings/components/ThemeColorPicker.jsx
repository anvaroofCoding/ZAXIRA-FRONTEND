import { useEffect, useState } from 'react'
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined'
import RestartAltOutlinedIcon from '@mui/icons-material/RestartAltOutlined'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useColorMode } from '@/shared/hooks/useColorMode'
import { normalizeThemeColor, THEME_COLOR_PRESETS } from '@/shared/theme/themeColor'

const SwatchButton = ({ color, label, selected, onSelect }) => (
  <Tooltip title={label} arrow>
    <IconButton
      onClick={() => onSelect(color)}
      aria-label={label}
      aria-pressed={selected}
      sx={{
        p: 0.5,
        borderRadius: 2,
        border: '2px solid',
        borderColor: selected ? 'primary.main' : 'transparent',
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: color,
          boxShadow: 1,
        }}
      />
    </IconButton>
  </Tooltip>
)

export const ThemeColorPicker = () => {
  const { primaryColor, setPrimaryColor, resetPrimaryColor, defaultPrimaryColor } =
    useColorMode()
  const [draftHex, setDraftHex] = useState(primaryColor)

  useEffect(() => {
    setDraftHex(primaryColor)
  }, [primaryColor])

  const isDefault = primaryColor === defaultPrimaryColor

  const applyHex = (rawValue) => {    const normalized = normalizeThemeColor(rawValue)
    setDraftHex(normalized)
    setPrimaryColor(normalized)
  }

  return (
    <Stack spacing={2.5}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <PaletteOutlinedIcon color="primary" />
        <Typography variant="subtitle1" fontWeight={600}>
          Interfeys rangi
        </Typography>
      </Stack>

      <Box>
        <Typography variant="body2" fontWeight={600} gutterBottom>
          Tayyor ranglar
        </Typography>
        <Grid container spacing={1}>
          {THEME_COLOR_PRESETS.map((preset) => (
            <Grid key={preset.value} size="auto">
              <SwatchButton
                color={preset.value}
                label={preset.label}
                selected={primaryColor === preset.value}
                onSelect={applyHex}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        alignItems={{ xs: 'stretch', sm: 'center' }}
      >
        <TextField
          label="HEX rang kodi"
          size="small"
          value={draftHex}
          onChange={(event) => setDraftHex(event.target.value)}
          onBlur={() => applyHex(draftHex)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              applyHex(draftHex)
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Box
                    sx={{
                      width: 22,
                      height: 22,
                      borderRadius: 0.75,
                      bgcolor: normalizeThemeColor(draftHex),
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{ minWidth: { sm: 220 } }}
        />

        <Button component="label" variant="outlined" sx={{ alignSelf: { xs: 'stretch', sm: 'auto' } }}>
          Rang tanlash
          <input
            type="color"
            hidden
            value={normalizeThemeColor(draftHex)}
            onChange={(event) => applyHex(event.target.value)}
          />
        </Button>

        <Button
          variant="text"
          startIcon={<RestartAltOutlinedIcon />}
          onClick={resetPrimaryColor}
          disabled={isDefault}
        >
          Standart
        </Button>
      </Stack>
    </Stack>
  )
}
