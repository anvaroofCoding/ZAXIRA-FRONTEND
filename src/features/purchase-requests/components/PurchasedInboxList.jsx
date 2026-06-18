import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PurchaseBatchCard } from '@/features/purchase-requests/components/PurchaseBatchCard'
import { enrichBatchContractInfo } from '@/features/purchase-requests/utils/purchaseDisplayUtils'
import { formatUzs } from '@/shared/utils/formatUzs'

export const PurchasedInboxList = ({ items, emptyMessage, onView }) => {
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
        const batches = [...(request.purchaseBatches ?? [])].sort(
          (left, right) =>
            new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
        )
        const purchasedCount = request.items.filter((item) => item.isPurchased).length

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
                <Chip
                  size="small"
                  color="primary"
                  label={`${purchasedCount} ta xarid qilingan`}
                />
              </Stack>
              <Button size="small" variant="outlined" onClick={() => onView(request)}>
                Batafsil
              </Button>
            </Box>

            <Box sx={{ p: 2 }}>
              <Stack spacing={2}>
                {batches.map((batch, index) => (
                  <PurchaseBatchCard
                    key={batch.batchId}
                    batch={enrichBatchContractInfo(batch, request)}
                    batchNumber={batches.length - index}
                    items={request.items}
                    requestId={request.id}
                    compact
                  />
                ))}
              </Stack>

              {request.purchaseTotalAmount != null ? (
                <Paper
                  variant="outlined"
                  sx={{ p: 1.5, mt: 2, borderRadius: 1.5, bgcolor: 'background.default' }}
                >
                  <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Umumiy xarid summasi
                    </Typography>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {formatUzs(request.purchaseTotalAmount)}
                    </Typography>
                  </Stack>
                </Paper>
              ) : null}
            </Box>
          </Paper>
        )
      })}
    </Stack>
  )
}
