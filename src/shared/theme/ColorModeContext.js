import { createContext } from 'react'
import { DEFAULT_PRIMARY_COLOR } from './themeColor'
import { DEFAULT_STATUS_COLORS } from './statusColors'

export const ColorModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
  primaryColor: DEFAULT_PRIMARY_COLOR,
  setPrimaryColor: () => {},
  resetPrimaryColor: () => {},
  statusColors: DEFAULT_STATUS_COLORS,
  setStatusColors: () => {},
  resetStatusColors: () => {},
})
