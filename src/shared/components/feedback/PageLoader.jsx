import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'

export const PageLoader = () => (
  <Box
    role="progressbar"
    aria-label="Sahifa yuklanmoqda"
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '40vh',
      width: '100%',
    }}
  >
    <CircularProgress color="primary" />
  </Box>
)
