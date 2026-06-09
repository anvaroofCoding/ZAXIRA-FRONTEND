import dayjs from 'dayjs'

export const formatLastOnline = (value) => {
  if (!value) return null

  const date = dayjs(value)
  if (!date.isValid()) return null

  const now = dayjs()

  if (date.isSame(now, 'day')) {
    return `Bugun, ${date.format('HH:mm')}`
  }

  if (date.isSame(now.subtract(1, 'day'), 'day')) {
    return `Kecha, ${date.format('HH:mm')}`
  }

  return date.format('DD.MM.YYYY, HH:mm')
}
