export const TRANSFER_CANCEL_OTHER_REASON_KEY = 'other'

export const TRANSFER_CANCEL_REASONS = [
  { key: 'wrong_recipient', label: 'Noto‘g‘ri qabul qiluvchi tanlangan' },
  { key: 'wrong_items', label: 'Noto‘g‘ri tovarlar tanlangan' },
  { key: 'duplicate', label: 'Takroriy transfer' },
  { key: 'no_longer_needed', label: 'Endi kerak emas' },
  { key: 'quantity_mistake', label: 'Miqdor xatosi' },
  { key: TRANSFER_CANCEL_OTHER_REASON_KEY, label: 'Boshqa' },
]
