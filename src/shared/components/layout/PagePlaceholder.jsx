import Typography from '@mui/material/Typography'
import { PageShell } from './PageShell'

export const PagePlaceholder = ({ title }) => (
  <PageShell>
    <Typography variant="h5" component="h1" fontWeight={600}>
      {title}
    </Typography>
  </PageShell>
)
