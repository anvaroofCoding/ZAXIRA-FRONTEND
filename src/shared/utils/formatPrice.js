const CURRENCY_LABELS = {
  UZS: "so'm",
  USD: '$',
  RUB: '₽',
  EUR: '€',
}

export const formatPriceValue = (value, currency = 'UZS') => {
  if (value == null || !Number.isFinite(value)) {
    return null
  }

  const code = String(currency).toUpperCase()

  try {
    const fractionDigits = code === 'USD' ? 2 : 0
    return new Intl.NumberFormat('uz-UZ', {
      style: 'currency',
      currency: code,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(value)
  } catch {
    const label = CURRENCY_LABELS[code] ?? code
    return `${Math.round(value).toLocaleString('uz-UZ')} ${label}`
  }
}

export const formatConvertedPriceLine = (converted) => {
  if (!converted) return []

  return [
    { code: 'UZS', value: converted.uzs, label: "so'm" },
    { code: 'USD', value: converted.usd, label: '$' },
    { code: 'RUB', value: converted.rub, label: '₽' },
  ]
    .filter((row) => row.value != null && Number.isFinite(row.value))
    .map((row) => ({
      ...row,
      formatted: formatPriceValue(row.value, row.code),
    }))
}
