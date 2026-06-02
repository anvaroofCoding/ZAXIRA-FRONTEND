import { useMemo } from 'react'
import Box from '@mui/material/Box'
import { PickerDay } from '@mui/x-date-pickers/PickerDay'
import { CALENDAR_EVENT_META, getCalendarDayEventTypes } from '@/features/dashboard/utils/calendarEventMeta'

export const CalendarEventDay = (props) => {
  const { day, outsideCurrentMonth, daySummary, onDayClick, ...other } = props
  const dayKey = day.format('YYYY-MM-DD')
  const eventTypes = useMemo(
    () => getCalendarDayEventTypes(daySummary?.[dayKey]),
    [dayKey, daySummary],
  )
  const hasEvents = eventTypes.length > 0

  return (
    <Box
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <PickerDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        onClick={(event) => {
          other.onClick?.(event)
          onDayClick?.(day)
        }}
        sx={{
          ...(other.sx ?? {}),
          fontWeight: hasEvents ? 700 : 400,
        }}
      />
      {hasEvents ? (
        <Box
          sx={{
            position: 'absolute',
            bottom: 4,
            display: 'flex',
            gap: 0.35,
            pointerEvents: 'none',
          }}
        >
          {eventTypes.map((type) => (
            <Box
              key={`${dayKey}-${type}`}
              sx={{
                width: 5,
                height: 5,
                borderRadius: '50%',
                bgcolor: CALENDAR_EVENT_META[type].color,
              }}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  )
}
