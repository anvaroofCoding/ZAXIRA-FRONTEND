export const formatDateOnly = (value) => {
  if (!value) return '—'

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return '—'

  return new Intl.DateTimeFormat('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

export const formatPurchaseDeadline = (deadline, mandatory) => {
  if (!deadline) return null

  const dateLabel = formatDateOnly(deadline)
  const typeLabel = mandatory ? 'majburiy' : 'ixtiyoriy'

  return `${dateLabel} (${typeLabel})`
}
