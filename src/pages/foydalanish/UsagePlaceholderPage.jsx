import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PageShell } from '@/shared/components/layout/PageShell'

export const UsagePlaceholderPage = ({ title, description }) => (
  <PageShell>
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Stack spacing={1.5}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
        <Box
          sx={{
            mt: 1,
            px: 2,
            py: 3,
            borderRadius: 1,
            border: 1,
            borderColor: 'divider',
            bgcolor: 'action.hover',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Bu bo‘lim hozircha tayyorlanmoqda. Tez orada to‘liq ma’lumot qo‘shiladi.
          </Typography>
        </Box>
      </Stack>
    </Paper>
  </PageShell>
)
