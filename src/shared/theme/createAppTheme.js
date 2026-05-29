import { createTheme } from '@mui/material/styles'

export const createAppTheme = (mode) =>
  createTheme({
    cssVariables: true,
    palette: {
      mode,
      primary: {
        main: mode === 'dark' ? '#90caf9' : '#1565c0',
      },
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
