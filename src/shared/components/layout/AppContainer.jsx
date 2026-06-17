import Box from '@mui/material/Box'
import { APP_CONTAINER_WIDTH } from '@/shared/constants/layout'

export const AppContainer = ({ children, sx, ...props }) => (
  <Box
    sx={{
      width: APP_CONTAINER_WIDTH,
      maxWidth: 'none',
      px: { xs: 2, sm: 2.5, lg: 3 },
      boxSizing: 'border-box',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
)
