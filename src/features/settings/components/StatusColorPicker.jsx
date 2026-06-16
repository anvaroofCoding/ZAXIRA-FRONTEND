import { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import InputAdornment from '@mui/material/InputAdornment'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useColorMode } from '@/shared/hooks/useColorMode'
import {
  STATUS_COLOR_DESCRIPTIONS,
  STATUS_COLOR_KEYS,
  STATUS_COLOR_LABELS,
  STATUS_COLOR_PRESETS,
  isDefaultStatusColors,
  normalizeStatusColor,
} from '@/shared/theme/statusColors'

const ColorRow = ({ colorKey, value, onChange }) => {
  const [draftHex, setDraftHex] = useState(value)

  useEffect(() => {
    setDraftHex(value)
  }, [value])

  const applyHex = (rawValue) => {
    const normalized = normalizeStatusColor(rawValue, value)
    setDraftHex(normalized)
    onChange(colorKey, normalized)
  }

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" fontWeight={600}>
          {STATUS_COLOR_LABELS[colorKey]}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {STATUS_COLOR_DESCRIPTIONS[colorKey]}
        </Typography>
      </Box>

      <Chip
        size="small"
        label="Namuna"
        color={colorKey}
        sx={{ fontWeight: 600, display: { xs: 'none', sm: 'inline-flex' } }}
      />

      <TextField
        label="HEX"
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
                    bgcolor: normalizeStatusColor(draftHex, value),
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                />
              </InputAdornment>
            ),
          },
        }}
        sx={{ width: { xs: '100%', sm: 160 } }}
      />

      <Button component="label" variant="outlined" size="small">
        Tanlash
        <input
          type="color"
          hidden
          value={normalizeStatusColor(draftHex, value)}
          onChange={(event) => applyHex(event.target.value)}
        />
      </Button>
    </Stack>
  )
}

export const StatusColorPicker = () => {
  const {
    statusColors,
    setStatusColors,
    resetStatusColors,
  } = useColorMode()

  const isDefault = isDefaultStatusColors(statusColors)

  const handleColorChange = (key, hex) => {
    setStatusColors({ ...statusColors, [key]: hex })
  }

  const applyPreset = (preset) => {
    setStatusColors(preset.colors)
  }

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="subtitle1" fontWeight={600}>
          Holat ranglari
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Holat belgilari (chip, badge) uchun ranglar
        </Typography>
      </Box>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {STATUS_COLOR_PRESETS.map((preset) => {
          const isSelected = STATUS_COLOR_KEYS.every(
            (key) => statusColors[key] === preset.colors[key],
          )

          return (
            <Button
              key={preset.label}
              size="small"
              variant={isSelected ? 'contained' : 'outlined'}
              onClick={() => applyPreset(preset)}
            >
              {preset.label}
            </Button>
          )
        })}
      </Stack>

      <Stack spacing={2} divider={<Box sx={{ borderBottom: 1, borderColor: 'divider' }} />}>
        {STATUS_COLOR_KEYS.map((key) => (
          <ColorRow
            key={key}
            colorKey={key}
            value={statusColors[key]}
            onChange={handleColorChange}
          />
        ))}
      </Stack>

      <Grid container spacing={1}>
        {STATUS_COLOR_KEYS.map((key) => (
          <Grid key={key} size="auto">
            <Chip size="small" label={STATUS_COLOR_LABELS[key]} color={key} />
          </Grid>
        ))}
      </Grid>

      <Box>
        <Button variant="text" onClick={resetStatusColors} disabled={isDefault}>
          Standart ranglar
        </Button>
      </Box>
    </Stack>
  )
}
