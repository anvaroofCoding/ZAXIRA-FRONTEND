import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PurchaseBatchCard } from '@/features/purchase-requests/components/PurchaseBatchCard'
import { PurchaseUnavailableBatchCard } from '@/features/purchase-requests/components/PurchaseUnavailableBatchCard'
import { formatUzs } from '@/shared/utils/formatUzs'

export const PurchaseInfoSection = ({ request, onDispatchBatch }) => {
  const batches = request?.purchaseBatches ?? []
  const unavailableBatches = request?.purchaseUnavailableBatches ?? []

  if (!batches.length && !unavailableBatches.length) {
    return null
  }

  const sortedBatches = [...batches].sort(
    (left, right) => new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
  )
  const sortedUnavailableBatches = [...unavailableBatches].sort(
    (left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime(),
  )

  return (
    <Stack spacing={2}>
      {sortedBatches.length ? (
        <>
          <Typography variant="subtitle2" fontWeight={600}>
            Xarid qilingan partiyalar
          </Typography>
          <Stack spacing={2}>
            {sortedBatches.map((batch, index) => (
              <PurchaseBatchCard
                key={batch.batchId}
                batch={batch}
                batchNumber={sortedBatches.length - index}
                items={request.items}
                requestId={request.id}
                onDispatch={
                  onDispatchBatch
                    ? (selectedBatch) =>
                        onDispatchBatch({
                          ...selectedBatch,
                          batchNumber: sortedBatches.length - index,
                        })
                    : undefined
                }
              />
            ))}
          </Stack>
        </>
      ) : null}

      {sortedUnavailableBatches.length ? (
        <>
          <Typography variant="subtitle2" fontWeight={600}>
            Xarid qilib bo‘lmaydigan tovarlar
          </Typography>
          <Stack spacing={2}>
            {sortedUnavailableBatches.map((batch, index) => (
              <PurchaseUnavailableBatchCard
                key={batch.batchId}
                batch={batch}
                batchNumber={sortedUnavailableBatches.length - index}
                items={request.items}
              />
            ))}
          </Stack>
        </>
      ) : null}

      {request.purchaseTotalAmount != null ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
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
    </Stack>
  )
}
