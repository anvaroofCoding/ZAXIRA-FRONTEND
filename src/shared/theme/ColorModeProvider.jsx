import { useCallback, useEffect, useMemo, useState } from 'react'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { ColorModeContext } from './ColorModeContext'
import { createAppTheme } from './createAppTheme'
import {
  DEFAULT_PRIMARY_COLOR,
  THEME_COLOR_CHANGED,
  getStoredThemeColor,
  resetStoredThemeColor,
  setStoredThemeColor,
} from './themeColor'
import {
  DEFAULT_STATUS_COLORS,
  STATUS_COLORS_CHANGED,
  getStoredStatusColors,
  resetStoredStatusColors,
  setStoredStatusColors,
} from './statusColors'

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
  const [primaryColor, setPrimaryColorState] = useState(getStoredThemeColor)
  const [statusColors, setStatusColorsState] = useState(getStoredStatusColors)

  useEffect(() => {
    const syncThemeColor = () => {
      setPrimaryColorState(getStoredThemeColor())
    }

    window.addEventListener(THEME_COLOR_CHANGED, syncThemeColor)
    return () => window.removeEventListener(THEME_COLOR_CHANGED, syncThemeColor)
  }, [])

  useEffect(() => {
    const syncStatusColors = () => {
      setStatusColorsState(getStoredStatusColors())
    }

    window.addEventListener(STATUS_COLORS_CHANGED, syncStatusColors)
    return () => window.removeEventListener(STATUS_COLORS_CHANGED, syncStatusColors)
  }, [])

  const toggleMode = useCallback(() => {
    setMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light'
      localStorage.setItem(STORAGE_KEY, next)
      return next
    })
  }, [])

  const setPrimaryColor = useCallback((value) => {
    setPrimaryColorState(setStoredThemeColor(value))
  }, [])

  const resetPrimaryColor = useCallback(() => {
    setPrimaryColorState(resetStoredThemeColor())
  }, [])

  const setStatusColors = useCallback((colors) => {
    setStatusColorsState(setStoredStatusColors(colors))
  }, [])

  const resetStatusColors = useCallback(() => {
    setStatusColorsState(resetStoredStatusColors())
  }, [])

  const theme = useMemo(
    () => createAppTheme(mode, primaryColor, statusColors),
    [mode, primaryColor, statusColors],
  )

  const contextValue = useMemo(
    () => ({
      mode,
      toggleMode,
      primaryColor,
      setPrimaryColor,
      resetPrimaryColor,
      defaultPrimaryColor: DEFAULT_PRIMARY_COLOR,
      statusColors,
      setStatusColors,
      resetStatusColors,
      defaultStatusColors: DEFAULT_STATUS_COLORS,
    }),
    [
      mode,
      primaryColor,
      resetPrimaryColor,
      resetStatusColors,
      setPrimaryColor,
      setStatusColors,
      statusColors,
      toggleMode,
    ],
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
