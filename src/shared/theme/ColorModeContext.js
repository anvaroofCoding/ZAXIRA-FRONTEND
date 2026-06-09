import { createContext } from 'react'
import { DEFAULT_PRIMARY_COLOR } from './themeColor'

export const ColorModeContext = createContext({
  mode: 'light',
  toggleMode: () => {},
  primaryColor: DEFAULT_PRIMARY_COLOR,
  setPrimaryColor: () => {},
  resetPrimaryColor: () => {},
})
