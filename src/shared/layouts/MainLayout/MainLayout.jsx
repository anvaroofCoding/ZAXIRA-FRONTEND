import { useLocation, useOutlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { ChatFabDrawer } from '@/shared/components/chat/ChatFabDrawer'
import { AppNavbar } from '@/shared/components/layout/AppNavbar'

export const MainLayout = () => {
  const location = useLocation()
  const outlet = useOutlet()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppNavbar />

      <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
        <AppContainer>
          <div key={location.pathname}>{outlet}</div>
        </AppContainer>
      </Box>
      <ChatFabDrawer />
    </Box>
  )
}
