import { Outlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { ChatFabDrawer } from '@/shared/components/chat/ChatFabDrawer'
import { AppNavbar } from '@/shared/components/layout/AppNavbar'

export const MainLayout = () => (
  <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <AppNavbar />

    <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
      <AppContainer>
        <Outlet />
      </AppContainer>
    </Box>
    <ChatFabDrawer />
  </Box>
)
