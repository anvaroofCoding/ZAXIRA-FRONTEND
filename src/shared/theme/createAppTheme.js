import { createTheme } from '@mui/material/styles'
import { DEFAULT_PRIMARY_COLOR } from './themeColor'
import { DEFAULT_STATUS_COLORS } from './statusColors'

const augmentPaletteColor = (baseTheme, main, name) =>
  baseTheme.palette.augmentColor({
    color: { main },
    name,
  })

export const createAppTheme = (
  mode,
  primaryMain = DEFAULT_PRIMARY_COLOR,
  statusColors = DEFAULT_STATUS_COLORS,
) => {
  const baseTheme = createTheme({
    palette: { mode },
  })

  const primary = augmentPaletteColor(baseTheme, primaryMain, 'primary')
  const success = augmentPaletteColor(baseTheme, statusColors.success, 'success')
  const warning = augmentPaletteColor(baseTheme, statusColors.warning, 'warning')
  const error = augmentPaletteColor(baseTheme, statusColors.error, 'error')
  const info = augmentPaletteColor(baseTheme, statusColors.info, 'info')
  const secondary = augmentPaletteColor(baseTheme, statusColors.secondary, 'secondary')

  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      primary,
      success,
      warning,
      error,
      info,
      secondary,
      background: {
        default: mode === 'dark' ? '#0f1115' : '#f5f7fa',
        paper: mode === 'dark' ? '#171a21' : '#ffffff',
      },
    },
    shape: {
      borderRadius: 10,
    },
    typography: {
      fontFamily: [
        'Inter',
        'system-ui',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ].join(','),
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true,
        },
      },
    },
  })
}
