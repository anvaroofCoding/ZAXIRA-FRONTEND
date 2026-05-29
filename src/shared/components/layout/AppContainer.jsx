import Box from '@mui/material/Box'
import {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_WIDTH,
} from '@/shared/constants/layout'

export const AppContainer = ({ children, sx, ...props }) => (
  <Box
    sx={{
      width: APP_CONTAINER_WIDTH,
      maxWidth: APP_CONTAINER_MAX_WIDTH,
      mx: 'auto',
      px: { xs: 1.5, sm: 2 },
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
)
