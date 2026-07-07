import { useEffect } from 'react'
import { useLocation, useOutlet } from 'react-router-dom'
import Box from '@mui/material/Box'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { ChatFabDrawer } from '@/shared/components/chat/ChatFabDrawer'
import { AppNavbar } from '@/shared/components/layout/AppNavbar'
import { AppSideRail } from '@/shared/components/layout/AppSideRail'
import { MyTasksBanner } from '@/features/tasks/components/MyTasksBanner'
import { probeTasksApiAvailability } from '@/features/tasks/utils/tasksApiAvailability'

export const MainLayout = () => {
  const location = useLocation()
  const outlet = useOutlet()

  useEffect(() => {
    probeTasksApiAvailability()
  }, [])

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', height: '100vh', bgcolor: 'background.default' }}>
      <AppNavbar />

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <AppSideRail />

        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            bgcolor: 'background.default',
          }}
        >
          <MyTasksBanner />

          <Box
            component="main"
            sx={{ flex: 1, minHeight: 0, overflow: 'auto', py: 3 }}
          >
            <AppContainer>
              <div key={location.pathname}>{outlet}</div>
            </AppContainer>
          </Box>
        </Box>
      </Box>

      <ChatFabDrawer />
    </Box>
  )
}
