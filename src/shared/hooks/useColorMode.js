import { useContext } from 'react'
import { ColorModeContext } from '@/shared/theme/ColorModeContext'

export const useColorMode = () => useContext(ColorModeContext)
