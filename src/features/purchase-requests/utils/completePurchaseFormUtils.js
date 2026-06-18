import { MEASUREMENT_UNITS } from '@/features/purchase-requests/constants/measurementUnits'
import { parseUzsInput } from '@/shared/utils/formatUzs'

export const newLink = () => ({ id: crypto.randomUUID(), url: '' })
export const newFileRow = () => ({ id: crypto.randomUUID(), file: null })

export const TAX_ID_LENGTH = {
  inn: 9,
  pinfl: 14,
}

export const TAX_ID_TYPE_OPTIONS = [
  { value: 'inn', label: 'INN' },
  { value: 'pinfl', label: 'PINFL' },
]

export const validatePurchaseContractFields = ({
  contractNumber = '',
  organizationName = '',
  taxIdType = '',
  taxIdNumber = '',
}) => {
  const trimmedContractNumber = contractNumber.trim()
  const trimmedOrganizationName = organizationName.trim()
  const trimmedTaxIdNumber = taxIdNumber.trim()

  if (!trimmedContractNumber) {
    return 'Shartnoma raqamini kiriting'
  }

  if (!trimmedOrganizationName) {
    return 'Tashkilot nomini kiriting'
  }

  if (!taxIdType) {
    return 'Identifikator turini tanlang (INN yoki PINFL)'
  }

  if (!trimmedTaxIdNumber) {
    return 'INN yoki PINFL raqamini kiriting'
  }

  const expectedLength = TAX_ID_LENGTH[taxIdType]

  if (trimmedTaxIdNumber.length !== expectedLength) {
    return taxIdType === 'inn'
      ? 'INN 9 ta raqamdan iborat bo‘lishi kerak'
      : 'PINFL 14 ta raqamdan iborat bo‘lishi kerak'
  }

  return ''
}

export const isPurchaseContractComplete = (fields) =>
  !validatePurchaseContractFields(fields)

export const VAT_RATE_OPTIONS = [
  { value: '0', label: 'QQSsiz' },
  { value: '6', label: '6%' },
  { value: '12', label: '12%' },
]

export const isItemPending = (item) => !item.isPurchased && !item.isPurchaseUnavailable

export const buildPendingRow = (item, index) => ({
  itemIndex: index,
  selected: false,
  name: item.name,
  characteristics: item.characteristics,
  quantity: String(item.quantity),
  originalQuantity: item.quantity,
  unit: item.unit?.trim() || 'dona',
  amount: '',
  vatRate: '0',
  vatAmount: '',
})

export const buildPendingRowsFromRequest = (request) =>
  (request?.items ?? [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => isItemPending(item))
    .map(({ item, index }) => buildPendingRow(item, index))

export const formatAmountInput = (value) => {
  const digits = value.replace(/\D/g, '')
  return digits ? new Intl.NumberFormat('uz-UZ').format(Number(digits)) : ''
}

export const resolveUnitOptions = (currentUnit) => {
  const trimmed = currentUnit?.trim()

  if (trimmed && !MEASUREMENT_UNITS.includes(trimmed)) {
    return [trimmed, ...MEASUREMENT_UNITS]
  }

  return MEASUREMENT_UNITS
}

export const calculateVatAmountInput = (amountInput, vatRate) => {
  const amount = parseUzsInput(amountInput) || 0
  const rate = Number(vatRate)

  if (!rate || !amount) {
    return ''
  }

  return formatAmountInput(String(Math.round((amount * rate) / 100)))
}

export const getRowUnitTotal = (row) => {
  const amount = parseUzsInput(row.amount) || 0
  const vatAmount = parseUzsInput(row.vatAmount) || 0
  return amount + vatAmount
}

export const getRowLineTotal = (row) => {
  const quantity = Number(row.quantity) || 0
  return getRowUnitTotal(row) * quantity
}

export const buildPurchaseWorkspacePath = (requestId) =>
  `/xarid-qilish/sotib-olinadigan-tavarlar/${requestId}/xarid-qilish`
