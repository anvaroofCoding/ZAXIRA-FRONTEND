export const getPurchaseUnitTotal = (item) =>
  Number(item?.purchaseAmount ?? 0) + Number(item?.purchaseVatAmount ?? 0)

export const getPurchaseLineTotal = (item) =>
  getPurchaseUnitTotal(item) * Number(item?.quantity ?? 0)

export const formatPurchaseVatRateLabel = (vatRate) => {
  const rate = Number(vatRate) || 0
  return rate > 0 ? `${rate}%` : 'INDS siz'
}

export const formatTaxIdTypeLabel = (type) => {
  if (type === 'inn') return 'INN'
  if (type === 'pinfl') return 'PINFL'
  return 'INN/PINFL'
}

export const hasPurchaseContractInfo = (batch) =>
  Boolean(
    batch?.contractNumber?.trim() ||
      batch?.organizationName?.trim() ||
      batch?.innOrPinfl?.trim(),
  )

const PURCHASE_HISTORY_TYPES = new Set(['PURCHASED', 'PARTIAL_PURCHASE'])

const resolveContractFromHistory = (request, batchId) => {
  const steps = [...(request?.history ?? [])]
    .filter(
      (step) =>
        PURCHASE_HISTORY_TYPES.has(step.type) &&
        (!batchId || step.purchaseBatchId === batchId),
    )
    .sort(
      (left, right) =>
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    )

  for (const step of steps) {
    if (hasPurchaseContractInfo(step)) {
      return step
    }
  }

  return null
}

export const resolveLatestContractInfo = (request) => {
  const sortedBatches = [...(request?.purchaseBatches ?? [])].sort(
    (left, right) => new Date(right.purchasedAt).getTime() - new Date(left.purchasedAt).getTime(),
  )

  for (const batch of sortedBatches) {
    const enriched = enrichBatchContractInfo(batch, request)
    if (hasPurchaseContractInfo(enriched)) {
      return enriched
    }
  }

  const historyContract = resolveContractFromHistory(request)
  if (historyContract) {
    return historyContract
  }

  const purchase = request?.purchase
  if (purchase && hasPurchaseContractInfo(purchase)) {
    return purchase
  }

  return null
}

export const enrichBatchContractInfo = (batch, request) => {
  const purchase = request?.purchase
  const history = resolveContractFromHistory(request, batch?.batchId)

  return {
    ...batch,
    contractNumber:
      batch?.contractNumber?.trim() ||
      history?.contractNumber?.trim() ||
      purchase?.contractNumber?.trim() ||
      '',
    organizationName:
      batch?.organizationName?.trim() ||
      history?.organizationName?.trim() ||
      purchase?.organizationName?.trim() ||
      '',
    innOrPinfl:
      batch?.innOrPinfl?.trim() ||
      history?.innOrPinfl?.trim() ||
      purchase?.innOrPinfl?.trim() ||
      '',
    innOrPinflType:
      batch?.innOrPinflType?.trim() ||
      history?.innOrPinflType?.trim() ||
      purchase?.innOrPinflType?.trim() ||
      '',
  }
}

export const summarizePurchasedItems = (items = []) => {
  const purchasedItems = items.filter((item) => item.isPurchased)

  return purchasedItems.reduce(
    (summary, item) => {
      const amount = Number(item.purchaseAmount ?? 0)
      const vatAmount = Number(item.purchaseVatAmount ?? 0)
      const quantity = Number(item.quantity ?? 0)

      summary.subtotal += amount * quantity
      summary.vatTotal += vatAmount * quantity
      summary.grandTotal += (amount + vatAmount) * quantity

      return summary
    },
    { subtotal: 0, vatTotal: 0, grandTotal: 0 },
  )
}
