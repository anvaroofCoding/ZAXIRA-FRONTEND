import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { IshonchnomaInboxList } from '@/features/purchase-requests/components/IshonchnomaInboxList'
import { IshonchnomaUploadDialog } from '@/features/purchase-requests/components/IshonchnomaUploadDialog'
import { enrichBatchContractInfo } from '@/features/purchase-requests/utils/purchaseDisplayUtils'

const buildBatchItems = (batch, items) => {
  const indexedItems = items.map((item, itemIndex) => ({ ...item, itemIndex }))

  if (batch.batchId === 'legacy') {
    const indexes = new Set(batch.itemAmounts.map((row) => row.itemIndex))
    return indexedItems
      .filter((item) => indexes.has(item.itemIndex))
      .map((item) => ({
        itemIndex: item.itemIndex,
        name: item.name,
        characteristics: item.characteristics,
        quantity: item.quantity,
        unit: item.unit ?? '',
      }))
  }

  return indexedItems
    .filter((item) => item.purchaseBatchId === batch.batchId)
    .map((item) => ({
      itemIndex: item.itemIndex,
      name: item.name,
      characteristics: item.characteristics,
      quantity: item.quantity,
      unit: item.unit ?? '',
    }))
}

export const RequestIshonchnomaSection = ({
  request,
  canUpload = true,
  autoOpenBatchId = null,
  onAutoOpenHandled,
}) => {
  const [uploadTarget, setUploadTarget] = useState(null)

  const entries = useMemo(() => {
    if (!request) {
      return []
    }

    const batches = [...(request.purchaseBatches ?? [])].sort(
      (left, right) =>
        new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
    )

    return batches.map((batch, index) => {
      const enrichedBatch = enrichBatchContractInfo(batch, request)

      return {
        requestId: request.id,
        requestCode: request.requestCode,
        applicant: request.applicant,
        batch: enrichedBatch,
        batchNumber: batches.length - index,
        items: buildBatchItems(enrichedBatch, request.items ?? []),
        ishonchnomaSubmitted: Boolean(enrichedBatch.ishonchnomaSubmitted),
      }
    })
  }, [request])

  const pendingCount = entries.filter((entry) => !entry.ishonchnomaSubmitted).length

  useEffect(() => {
    if (!autoOpenBatchId || !entries.length) {
      return
    }

    const targetEntry =
      entries.find((entry) => entry.batch.batchId === autoOpenBatchId) ?? entries[0]

    if (!targetEntry) {
      return
    }

    setUploadTarget({
      requestId: targetEntry.requestId,
      requestCode: targetEntry.requestCode,
      batchId: targetEntry.batch.batchId,
      batchNumber: targetEntry.batchNumber,
      organizationName: targetEntry.batch.organizationName,
    })
    onAutoOpenHandled?.()
  }, [autoOpenBatchId, entries, onAutoOpenHandled])

  const handleUpload = (entry) => {
    setUploadTarget({
      requestId: entry.requestId,
      requestCode: entry.requestCode,
      batchId: entry.batch.batchId,
      batchNumber: entry.batchNumber,
      organizationName: entry.batch.organizationName,
    })
  }

  if (!entries.length) {
    return (
      <Alert severity="info">
        Hozircha xarid qilingan partiyalar yo‘q. Avval tovarlarni xarid qiling — keyin ular shu
        bo‘limda ishonchnoma yuklash uchun paydo bo‘ladi.
      </Alert>
    )
  }

  return (
    <Stack spacing={2}>
      <Typography variant="body2" color="text.secondary">
        Xarid qilingan har bir partiya uchun ishonchnoma fayllarini yuklang.
        {pendingCount > 0
          ? ` ${pendingCount} ta partiyada ishonchnoma kutilmoqda.`
          : ' Barcha partiyalar uchun ishonchnoma yuborilgan.'}
      </Typography>

      <IshonchnomaInboxList
        items={entries}
        emptyMessage="Xarid partiyalari topilmadi"
        onUpload={handleUpload}
        canUpload={canUpload}
      />

      <IshonchnomaUploadDialog
        open={Boolean(uploadTarget)}
        target={uploadTarget}
        onClose={() => setUploadTarget(null)}
      />
    </Stack>
  )
}
