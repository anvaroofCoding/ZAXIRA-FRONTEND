import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SettingsContent } from '@/features/settings/components/SettingsContent'

export const SozlamalarPage = () => (
  <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
    <Paper
      variant="outlined"
      sx={{
        width: '100%',
        px: 2,
        py: 1.5,
      }}
    >
      <Stack spacing={0.25}>
        <Typography variant="h5" component="h1" fontWeight={600}>
          Sozlamalar
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Interfeys, holat ranglari, internet tezligi, bildirishnomalar va chat uchun shaxsiy sozlamalar
        </Typography>
      </Stack>
    </Paper>

    <SettingsContent />
  </Box>
)
