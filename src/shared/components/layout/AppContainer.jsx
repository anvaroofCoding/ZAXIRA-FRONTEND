import Box from '@mui/material/Box'
import {
  APP_CONTAINER_MAX_WIDTH,
  APP_CONTAINER_WIDTH,
  APP_CONTAINER_WIDTH_TABLET,
} from '@/shared/constants/layout'

export const AppContainer = ({ children, sx, ...props }) => (
  <Box
    sx={{
      width: {
        xs: APP_CONTAINER_WIDTH,
        sm: APP_CONTAINER_WIDTH_TABLET,
        lg: APP_CONTAINER_WIDTH,
      },
      maxWidth: APP_CONTAINER_MAX_WIDTH,
      mx: 'auto',
      ...sx,
    }}
    {...props}
  >
    {children}
  </Box>
)
