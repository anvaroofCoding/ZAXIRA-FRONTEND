export const HISTORY_EVENT_TYPE_OPTIONS = [
  { value: '', label: 'Barcha hodisalar' },
  { value: 'SUBMITTED', label: 'Ariza yuborildi' },
  { value: 'UPDATED', label: 'Ariza tahrirlandi' },
  { value: 'DECISION', label: 'Komissiya qarori' },
  { value: 'RESUBMITTED', label: 'Qayta yuborildi' },
  { value: 'BOSS_DECISION', label: 'Boshliq qarori' },
  { value: 'BOSS_CONFIRMED', label: 'Boshliq tasdiqladi' },
  { value: 'PURCHASED', label: 'Xarid qilindi' },
  { value: 'ITEMS_UNAVAILABLE', label: 'Xarid qilib bo‘lmaydi deb belgilandi' },
  { value: 'PURCHASE_REJECTED', label: 'Xarid rad etildi' },
]

export const PURCHASE_REQUEST_STATUS_OPTIONS = [
  { value: '', label: 'Barcha holatlar' },
  { value: 'COMMISSION_REVIEW', label: 'Kelishilmoqda' },
  { value: 'PARTIAL_REVISION', label: 'Rad etildi — tuzatib qayta yuborish' },
  { value: 'REJECTED', label: 'Rad etilgan' },
  { value: 'BOSS_DECISION_PENDING', label: 'Boshliq kelishmoqda' },
  { value: 'PURCHASING', label: 'Sotib olinmoqda' },
  { value: 'PURCHASED', label: 'Xarid qilindi' },
  { value: 'WAREHOUSE_IN_TRANSIT', label: 'Omborga jo‘natilgan' },
  { value: 'WAREHOUSE_COMPLETED', label: 'Omborga qabul qilindi' },
]
