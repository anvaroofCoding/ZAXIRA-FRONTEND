export const CALENDAR_EVENT_TYPES = {
  PURCHASE_DEADLINE: 'PURCHASE_DEADLINE',
  PURCHASE_ARRIVAL: 'PURCHASE_ARRIVAL',
  TRANSFER_ARRIVAL: 'TRANSFER_ARRIVAL',
  TASK_DEADLINE: 'TASK_DEADLINE',
  OVERDUE: 'OVERDUE',
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
  TASK_DEADLINE: {
    label: 'Vazifa muddati',
    color: '#7b1fa2',
  },
  OVERDUE: {
    label: 'Kechikkan vazifa',
    color: '#d32f2f',
  },
}

export const getCalendarDayEventTypes = (daySummary = {}) => {
  if ((daySummary.OVERDUE ?? 0) > 0) {
    return [CALENDAR_EVENT_TYPES.OVERDUE]
  }

  return Object.keys(CALENDAR_EVENT_META).filter(
    (type) => type !== CALENDAR_EVENT_TYPES.OVERDUE && (daySummary[type] ?? 0) > 0,
  )
}
