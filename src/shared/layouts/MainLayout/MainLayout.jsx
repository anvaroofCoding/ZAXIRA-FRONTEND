import { useLocation, useOutlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { ChatFabDrawer } from '@/shared/components/chat/ChatFabDrawer'
import { AppNavbar } from '@/shared/components/layout/AppNavbar'
import { AppSideRail } from '@/shared/components/layout/AppSideRail'

export const MainLayout = () => {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', height: '100vh', bgcolor: 'background.default' }}>
      <AppNavbar />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <AppSideRail />

        <Box
          component="main"
          sx={{ flex: 1, minWidth: 0, overflow: 'auto', py: 3, bgcolor: 'background.default' }}
        >
          <AppContainer>
            <div key={location.pathname}>{outlet}</div>
          </AppContainer>
        </Box>
      </Box>

      <ChatFabDrawer />
    </Box>
  )
}
