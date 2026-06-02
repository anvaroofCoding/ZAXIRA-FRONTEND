export const CALENDAR_EVENT_TYPES = {
  PURCHASE_DEADLINE: 'PURCHASE_DEADLINE',
  PURCHASE_ARRIVAL: 'PURCHASE_ARRIVAL',
  TRANSFER_ARRIVAL: 'TRANSFER_ARRIVAL',
}

export const CALENDAR_EVENT_META = {
  PURCHASE_DEADLINE: {
    label: 'Ariza muddati',
    color: '#ed6c02',
  },
  PURCHASE_ARRIVAL: {
    label: 'Xarid tovarlari kelishi',
    color: '#2e7d32',
  },
  TRANSFER_ARRIVAL: {
    label: 'Transfer kelishi',
    color: '#0288d1',
  },
}

export const getCalendarDayEventTypes = (daySummary = {}) =>
  Object.keys(CALENDAR_EVENT_META).filter((type) => (daySummary[type] ?? 0) > 0)
