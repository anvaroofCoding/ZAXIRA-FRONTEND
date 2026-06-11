import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { formatPurchasePeriod } from '@/features/purchase-requests/utils/formatPurchasePeriod'

export const PurchasePeriodDetailRow = ({ request }) => {
  const label = formatPurchasePeriod(request)

  if (!label) {
    return null
  }

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block">
        Sotib olish davri
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.25 }}>
        {label}
      </Typography>
    </Box>
  )
}
