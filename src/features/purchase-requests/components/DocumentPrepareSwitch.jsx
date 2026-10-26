import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'

export const DocumentPrepareSwitch = ({
  checked,
  onChange,
  disabled = false,
}) => (
  <Stack
    direction="row"
    alignItems="flex-start"
    justifyContent="space-between"
    spacing={2}
    sx={{ py: 0.25 }}
  >
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="subtitle2" fontWeight={600}>
        Faylni tayyorlash
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {checked
          ? 'Tizim bildirgi va kelishuv varaqasini avtomatik tayyorlaydi.'
          : 'Qo‘lda tayyorlaysizmi? Bildirgi va kelishuv varaqasini kompyuteringizdan yuklang.'}
      </Typography>
    </Box>
    <Switch
      checked={checked}
      onChange={(_event, value) => onChange(value)}
      disabled={disabled}
      inputProps={{ 'aria-label': 'Faylni tayyorlash' }}
    />
  </Stack>
)
