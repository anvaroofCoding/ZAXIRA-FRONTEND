import { createTheme } from '@mui/material/styles'
import { DEFAULT_PRIMARY_COLOR } from './themeColor'

export const createAppTheme = (mode, primaryMain = DEFAULT_PRIMARY_COLOR) => {
  const baseTheme = createTheme({
    palette: { mode },
  })

  const primary = baseTheme.palette.augmentColor({
    color: { main: primaryMain },
    name: 'primary',
  })

  return createTheme({
    cssVariables: true,
    palette: {
      mode,
      primary,
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
