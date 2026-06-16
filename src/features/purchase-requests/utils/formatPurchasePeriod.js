const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
]

const QUARTER_MONTHS = {
  1: 'yanvar, fevral, mart',
  2: 'aprel, may, iyun',
  3: 'iyul, avgust, sentyabr',
  4: 'oktyabr, noyabr, dekabr',
}

export const UZ_MONTH_OPTIONS = UZ_MONTHS.map((label, index) => ({
  value: index + 1,
  label,
}))

export const QUARTER_OPTIONS = [
  { value: 1, label: '1-chorak (yanvar, fevral, mart)' },
  { value: 2, label: '2-chorak (aprel, may, iyun)' },
  { value: 3, label: '3-chorak (iyul, avgust, sentyabr)' },
  { value: 4, label: '4-chorak (oktyabr, noyabr, dekabr)' },
]

export const buildYearOptions = (count = 5) => {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: count }, (_, index) => currentYear + index)
}

export const formatPurchasePeriod = (request) => {
  if (!request?.purchasePeriodType) {
    return null
  }

  if (request.purchasePeriodType === 'plain') {
    return 'Oddiy'
  }

  if (!request?.purchasePeriodYear) {
    return null
  }

  if (request.purchasePeriodType === 'quarter') {
    if (!request.purchasePeriodQuarter) return null
    const months = QUARTER_MONTHS[request.purchasePeriodQuarter]
    return `${request.purchasePeriodYear} yil, ${request.purchasePeriodQuarter}-chorak (${months})`
  }

  if (request.purchasePeriodType === 'month') {
    if (!request.purchasePeriodMonth) return null
    const monthName = UZ_MONTHS[request.purchasePeriodMonth - 1]
    return `${request.purchasePeriodYear} yil, ${monthName}`
  }

  return request.purchasePeriodLabel ?? null
}
