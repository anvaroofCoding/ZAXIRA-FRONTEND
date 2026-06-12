import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PurchaseUnavailableBatchCard } from '@/features/purchase-requests/components/PurchaseUnavailableBatchCard'

export const UnavailableInboxList = ({ items, emptyMessage, onView }) => {
  if (!items.length) {
    return (
      <Paper variant="outlined" sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={2}>
      {items.map((request) => {
        const batches = [...(request.purchaseUnavailableBatches ?? [])].sort(
          (left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime(),
        )

        return (
          <Paper key={request.id} variant="outlined">
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: 1,
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                gap: 2,
                flexWrap: 'wrap',
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="subtitle1" fontWeight={700}>
                  {request.requestCode}
                </Typography>
                <Chip size="small" color="warning" label="Xarid qilib bo‘lmaydi" />
                <Chip
                  size="small"
                  color="warning"
                  variant="outlined"
                  label={`${request.items.filter((item) => item.isPurchaseUnavailable).length} ta qilinmagan`}
                />
              </Stack>
              <Button size="small" variant="outlined" onClick={() => onView(request)}>
                Batafsil
              </Button>
            </Box>

            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                {batches.map((batch, index) => (
                  <PurchaseUnavailableBatchCard
                    key={batch.batchId}
                    batch={batch}
                    batchNumber={batches.length - index}
                    items={request.items}
                    compact
                  />
                ))}
              </Stack>
            </Box>
          </Paper>
        )
      })}
    </Stack>
  )
}
