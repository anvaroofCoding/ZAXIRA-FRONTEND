import { useMemo } from 'react'
import { useTheme } from '@mui/material/styles'
import {
  getMapControlButtonSx,
  getMapControlSurfaceSx,
  getWarehouseMapPalette,
} from '@/features/warehouse/utils/warehouseMapTheme'

export const useWarehouseMapPalette = () => {
  const theme = useTheme()
  const mode = theme.palette.mode

  return useMemo(
    () => ({
      mode,
      theme,
      palette: getWarehouseMapPalette(mode),
      controlSurfaceSx: getMapControlSurfaceSx(theme),
      controlButtonSx: getMapControlButtonSx(theme),
    }),
    [mode, theme],
  )
}
