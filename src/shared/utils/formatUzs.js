/** 10000000 → "10 000 000" */
export const formatUzs = (amount) => {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return '—'
  }

  const value = Math.round(Number(amount))

  return new Intl.NumberFormat('uz-UZ').format(value)
}

/** "10 000 000" → 10000000 */
export const parseUzsInput = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '')

  if (!digits) {
    return null
  }

  return Number(digits)
}
