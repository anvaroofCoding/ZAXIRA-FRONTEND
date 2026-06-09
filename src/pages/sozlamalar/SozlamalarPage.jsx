import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

export const SozlamalarPage = () => {
  return (
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
            Tizim sozlamalarini boshqarish
          </Typography>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography color="text.secondary">
          Sozlamalar bo‘limi tez orada to‘ldiriladi.
        </Typography>
      </Paper>
    </Box>
  )
}
