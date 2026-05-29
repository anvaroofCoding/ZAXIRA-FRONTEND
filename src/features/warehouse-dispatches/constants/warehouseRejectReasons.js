export const WAREHOUSE_REJECT_REASON_OTHER = 'OTHER'

export const WAREHOUSE_REJECT_REASONS = [
  { value: 'NOT_DELIVERED', label: 'Yetkazib berilmadi' },
  { value: 'WRONG_ITEM', label: 'Noto‘g‘ri tovar keldi' },
  { value: 'DAMAGED', label: 'Shikastlangan' },
  { value: 'INCOMPLETE', label: 'To‘liq emas / qisman yetishmagan' },
  { value: 'DOC_MISMATCH', label: 'Hujjatlar mos kelmadi' },
  { value: WAREHOUSE_REJECT_REASON_OTHER, label: 'Boshqa' },
]

export const resolveWarehouseRejectReason = (input) => {
  if (!input?.reasonCode) {
    return ''
  }

  if (input.reasonCode === WAREHOUSE_REJECT_REASON_OTHER) {
    return input.customReason?.trim() ?? ''
  }

  return (
    WAREHOUSE_REJECT_REASONS.find((reason) => reason.value === input.reasonCode)?.label ?? ''
  )
}

export const isWarehouseRejectReasonValid = (input) => {
  const qty = Number(String(input?.qty ?? '').replace(/\D/g, '')) || 0
  if (qty <= 0) {
    return true
  }

  if (!input?.reasonCode) {
    return false
  }

  if (input.reasonCode === WAREHOUSE_REJECT_REASON_OTHER) {
    return Boolean(input.customReason?.trim())
  }

  return true
}
