export const PURCHASE_REJECTION_REASONS = [
  { key: 'PRICE_MISMATCH', label: 'Narx mos kelmadi' },
  { key: 'NO_VENDOR', label: 'Yetkazib beruvchi topilmadi' },
  { key: 'BUDGET', label: 'Byudjet yetarli emas' },
  { key: 'OUT_OF_STOCK', label: 'Tovar mavjud emas' },
  { key: 'INVALID_REQUEST', label: 'Ariza ma’lumotlari noto‘g‘ri' },
  { key: 'OTHER', label: 'Boshqa' },
]

export const getPurchaseRejectionReasonLabel = (key) =>
  PURCHASE_REJECTION_REASONS.find((item) => item.key === key)?.label ?? key
