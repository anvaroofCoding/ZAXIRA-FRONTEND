import { useCallback, useMemo, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ColorModeContext } from './ColorModeContext'
import { createAppTheme } from './createAppTheme'

const STORAGE_KEY = 'zaxira-color-mode'

const getInitialMode = () => {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState(getInitialMode)

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  const theme = useMemo(() => createAppTheme(mode), [mode])

  const contextValue = useMemo(
    () => ({ mode, toggleMode }),
    [mode, toggleMode],
  )

  return (
    <ColorModeContext.Provider value={contextValue}>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}
