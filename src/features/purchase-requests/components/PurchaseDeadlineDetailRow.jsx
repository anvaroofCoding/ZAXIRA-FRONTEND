import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Typography from '@mui/material/Typography'
import { formatPurchaseDeadline } from '@/features/purchase-requests/utils/formatPurchaseDeadline'

export const PurchaseDeadlineDetailRow = ({ deadline, mandatory }) => {
  const label = formatPurchaseDeadline(deadline, mandatory)

  if (!label) {
    return null
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        Sotib olish muddati
      </Typography>
      <Box sx={{ mt: 0.5, display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">{label}</Typography>
        <Chip
          size="small"
          color={mandatory ? 'warning' : 'default'}
          variant={mandatory ? 'filled' : 'outlined'}
          label={mandatory ? 'Majburiy muddat' : 'Tavsiya etilgan muddat'}
        />
      </Box>
    </Box>
  )
}
