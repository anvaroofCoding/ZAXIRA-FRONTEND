import { Provider } from 'react-redux'
import { RouterProvider } from 'react-router-dom'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { AuthBootstrap } from '@/features/auth/components/AuthBootstrap'
import { router } from '@/app/router/router'
import { store } from '@/app/store/store'
import { GlobalSnackbar } from '@/shared/components/feedback/GlobalSnackbar'
import { InternetStatusBanner } from '@/shared/components/feedback/InternetStatusBanner'
import { ColorModeProvider } from '@/shared/theme/ColorModeProvider'

export const AppProviders = () => (
  <Provider store={store}>
    <ColorModeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AuthBootstrap>
          <InternetStatusBanner />
          <RouterProvider router={router} />
          <GlobalSnackbar />
        </AuthBootstrap>
      </LocalizationProvider>
    </ColorModeProvider>
  </Provider>
)
