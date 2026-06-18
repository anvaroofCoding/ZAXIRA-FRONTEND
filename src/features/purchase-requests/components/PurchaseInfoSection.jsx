import { useState } from 'react'
import EditIcon from '@mui/icons-material/Edit'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { PurchaseBatchCard } from '@/features/purchase-requests/components/PurchaseBatchCard'
import { PurchaseContractInfoBlock } from '@/features/purchase-requests/components/PurchaseContractInfoBlock'
import { PurchaseContractInfoEditDialog } from '@/features/purchase-requests/components/PurchaseContractInfoEditDialog'
import { PurchaseUnavailableBatchCard } from '@/features/purchase-requests/components/PurchaseUnavailableBatchCard'
import { useUpdatePurchaseBatchContractMutation } from '@/features/purchase-requests/api/purchaseRequestsApi'
import { useDispatch } from 'react-redux'
import { showNotification } from '@/shared/model/notificationSlice'
import {
  enrichBatchContractInfo,
  hasPurchaseContractInfo,
  resolveLatestContractInfo,
  summarizePurchasedItems,
} from '@/features/purchase-requests/utils/purchaseDisplayUtils'
import { formatUzs } from '@/shared/utils/formatUzs'

export const PurchaseInfoSection = ({
  request,
  onDispatchBatch,
  canEditContract = false,
}) => {
  const dispatch = useDispatch()
  const [editBatch, setEditBatch] = useState(null)
  const [updatePurchaseBatchContract, { isLoading: isUpdatingContract }] =
    useUpdatePurchaseBatchContractMutation()
  const batches = request?.purchaseBatches ?? []
  const unavailableBatches = request?.purchaseUnavailableBatches ?? []

  if (
    !batches.length &&
    !unavailableBatches.length &&
    request?.purchaseTotalAmount == null &&
    !resolveLatestContractInfo(request)
  ) {
    return null
  }

  const sortedBatches = [...batches].sort(
    (left, right) => new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
  )
  const sortedUnavailableBatches = [...unavailableBatches].sort(
    (left, right) => new Date(right.markedAt).getTime() - new Date(left.markedAt).getTime(),
  )
  const purchaseSummary = summarizePurchasedItems(request.items)
  const latestContractInfo = resolveLatestContractInfo(request)
  const contractDisplayBatch =
    latestContractInfo ||
    (sortedBatches[0] ? enrichBatchContractInfo(sortedBatches[0], request) : null)
  const shouldShowContractBlock =
    Boolean(contractDisplayBatch) &&
    (sortedBatches.length > 0 || hasPurchaseContractInfo(contractDisplayBatch))
  const editableBatch = sortedBatches[0] ?? null

  const handleSaveContract = async (body) => {
    const batchId = editBatch?.batchId ?? editableBatch?.batchId

    if (!batchId) {
      throw new Error('Xarid partiyasi topilmadi')
    }

    await updatePurchaseBatchContract({
      id: request.id,
      batchId,
      body,
    }).unwrap()

    dispatch(
      showNotification({
        message: 'Tashkilot ma’lumotlari saqlandi',
        severity: 'success',
      }),
    )
    setEditBatch(null)
  }

  return (
    <Stack spacing={2}>
      <Typography variant="subtitle2" fontWeight={600}>
        Xarid ma’lumotlari
      </Typography>

      {shouldShowContractBlock ? (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1.5 }}>
          <Stack direction="row" spacing={1} sx={{ justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>
              Tashkilot ma’lumotlari
            </Typography>
            {canEditContract && editableBatch ? (
              <Tooltip title="Tahrirlash">
                <IconButton size="small" onClick={() => setEditBatch(editableBatch)}>
                  <EditIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Stack>
          <PurchaseContractInfoBlock
            batch={contractDisplayBatch}
            title=""
            showPlaceholders={!hasPurchaseContractInfo(contractDisplayBatch)}
          />
        </Paper>
      ) : null}
      {sortedBatches.length ? (
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary" fontWeight={600}>
            Xarid qilingan partiyalar
          </Typography>
          {sortedBatches.map((batch, index) => (
            <PurchaseBatchCard
              key={batch.batchId}
              batch={enrichBatchContractInfo(batch, request)}
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
          <Stack spacing={1}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Summa (QQSsiz)
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatUzs(purchaseSummary.subtotal)}
              </Typography>
            </Stack>
            <Stack direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
              <Typography variant="body2" color="text.secondary">
                QQS jami
              </Typography>
              <Typography variant="body2" fontWeight={600}>
                {formatUzs(purchaseSummary.vatTotal)}
              </Typography>
            </Stack>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}
            >
              <Typography variant="subtitle2" fontWeight={700}>
                Umumiy xarid summasi
              </Typography>
              <Typography variant="subtitle1" fontWeight={700}>
                {formatUzs(request.purchaseTotalAmount)}
              </Typography>
            </Stack>
          </Stack>
        </Paper>
      ) : null}

      <PurchaseContractInfoEditDialog
        open={Boolean(editBatch)}
        batch={editBatch ? enrichBatchContractInfo(editBatch, request) : null}
        onClose={() => setEditBatch(null)}
        onSave={handleSaveContract}
        isSaving={isUpdatingContract}
      />
    </Stack>
  )
}
