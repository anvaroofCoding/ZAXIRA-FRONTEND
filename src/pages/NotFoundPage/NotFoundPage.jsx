import { Link as RouterLink } from 'react-router-dom'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PageShell } from '@/shared/components/layout/PageShell'

export const NotFoundPage = () => (
  <PageShell>
    <Stack spacing={2} sx={{ py: 4, alignItems: 'center' }}>
      <Typography variant="h3" component="h1" fontWeight={700}>
        404
      </Typography>
      <Typography variant="body1" color="text.secondary">
        Sahifa topilmadi.
      </Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Bosh sahifaga
      </Button>
    </Stack>
  </PageShell>
)
