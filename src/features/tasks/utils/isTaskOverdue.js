const APP_CALENDAR_TIME_ZONE = 'Asia/Tashkent'

const getCalendarDayKey = (value, timeZone = APP_CALENDAR_TIME_ZONE) => {
  if (!value) return ''

  const date = value instanceof Date ? value : new Date(value)

  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export const isTaskOverdue = (task, now = new Date()) => {
  if (!task || task.status === 'COMPLETED' || task.status === 'CANCELLED') {
    return false
  }

  const dueKey = getCalendarDayKey(task.dueDate)
  const todayKey = getCalendarDayKey(now)

  if (!dueKey || !todayKey) {
    return false
  }

  return dueKey <= todayKey
}
