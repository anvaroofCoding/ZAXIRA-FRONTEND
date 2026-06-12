import { useEffect, useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import { useColorMode } from '@/shared/hooks/useColorMode'
import { createAppTheme } from './createAppTheme'

/**
 * Forces light mode for its subtree while `active` is true.
 * Also sets document color-scheme to light so third-party widgets (e.g. SuperDoc) stay light.
 */
export const ForceLightModeScope = ({ active = true, children }) => {
  const { primaryColor } = useColorMode()
  const lightTheme = useMemo(
    () => createAppTheme('light', primaryColor),
    [primaryColor],
  )

  useEffect(() => {
    if (!active) return

    const root = document.documentElement
    const previousColorScheme = root.style.colorScheme

    root.style.colorScheme = 'light'
    root.dataset.zaxiraForceLight = 'true'

    return () => {
      root.style.colorScheme = previousColorScheme
      delete root.dataset.zaxiraForceLight
    }
  }, [active])

  if (!active) {
    return children
  }

  return <ThemeProvider theme={lightTheme}>{children}</ThemeProvider>
}
