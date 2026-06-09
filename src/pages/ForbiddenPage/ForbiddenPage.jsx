import { useState } from 'react'
import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { AppContainer } from '@/shared/components/layout/AppContainer'
import { readSessionExpiredMessage } from '@/shared/utils/sessionExpired'

export const ForbiddenPage = () => {
  const [message] = useState(() => readSessionExpiredMessage())

  return (
    <AppContainer>
      <Stack spacing={2} sx={{ py: 8, alignItems: 'center', textAlign: 'center' }}>
        <Typography variant="h3" component="h1" fontWeight={700}>
          403
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 420 }}>
          {message}
        </Typography>
        <Button component={RouterLink} to="/login" variant="contained">
          Login sahifasiga
        </Button>
      </Stack>
    </AppContainer>
  )
}
