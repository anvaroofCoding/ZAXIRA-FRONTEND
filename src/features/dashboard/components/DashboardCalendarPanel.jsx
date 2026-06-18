import { useCallback, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Grid from '@mui/material/Grid'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar'
import dayjs from 'dayjs'
import { CalendarEventDay } from '@/features/dashboard/components/CalendarEventDay'
import { useGetDashboardCalendarQuery } from '@/features/dashboard/api/dashboardApi'
import { CALENDAR_EVENT_META } from '@/features/dashboard/utils/calendarEventMeta'
import { formatDateOnly } from '@/features/purchase-requests/utils/formatPurchaseDeadline'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const CalendarDayEventsPanel = ({ date, events = [], onNavigate }) => {
  const dateLabel = date ? formatDateOnly(date) : '—'

  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="subtitle1" fontWeight={700}>
          {dateLabel}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {events.length ? `${events.length} ta hodisa` : 'Hodisalar yo‘q'}
        </Typography>
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {!date ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
            Kunni tanlang — shu kundagi hodisalar shu yerda ko‘rinadi.
          </Typography>
        ) : !events.length ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 2, pb: 2 }}>
            Bu kunda rejalashtirilgan hodisalar yo‘q.
          </Typography>
        ) : (
          <List disablePadding>
            {events.map((event, index) => {
              const meta = CALENDAR_EVENT_META[event.type] ?? {
                label: event.type,
                color: 'text.secondary',
              }
              const overdueMeta = CALENDAR_EVENT_META.OVERDUE

              return (
                <ListItem key={event.id} disablePadding>
                  <ListItemButton
                    onClick={() => onNavigate(event.navigatePath)}
                    sx={{
                      alignItems: 'flex-start',
                      px: 2,
                      py: 1.5,
                      borderTop: index === 0 ? 1 : 0,
                      borderBottom: index < events.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      borderRadius: 0,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      slotProps={{
                        primary: { component: 'div' },
                        secondary: { component: 'div' },
                      }}
                      primary={
                        <Stack
                          direction="row"
                          spacing={1}
                          sx={{ alignItems: 'center', flexWrap: 'wrap', gap: 0.5 }}
                        >
                          <Typography
                            variant="subtitle2"
                            fontWeight={700}
                            color={event.overdue ? 'error.main' : 'text.primary'}
                          >
                            {event.title}
                          </Typography>
                          {event.overdue ? (
                            <Chip
                              size="small"
                              label={overdueMeta.label}
                              sx={{
                                bgcolor: `${overdueMeta.color}22`,
                                color: overdueMeta.color,
                                fontWeight: 700,
                                border: 'none',
                              }}
                            />
                          ) : (
                            <Chip
                              size="small"
                              label={meta.label}
                              sx={{
                                bgcolor: `${meta.color}22`,
                                color: meta.color,
                                fontWeight: 600,
                                border: 'none',
                              }}
                            />
                          )}
                          {event.mandatory ? (
                            <Chip size="small" color="warning" label="Majburiy" variant="filled" />
                          ) : null}
                        </Stack>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {event.subtitle}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        )}
      </Box>
    </Box>
  )
}

export const DashboardCalendarPanel = ({ structureId, onNavigate }) => {
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs())
  const [selectedDay, setSelectedDay] = useState(() => dayjs())

  const monthRange = useMemo(() => {
    const start = visibleMonth.startOf('month').subtract(7, 'day')
    const end = visibleMonth.endOf('month').add(7, 'day')
    return {
      from: start.format('YYYY-MM-DD'),
      to: end.format('YYYY-MM-DD'),
    }
  }, [visibleMonth])

  const calendarQuery = useGetDashboardCalendarQuery(
    {
      structureId,
      from: monthRange.from,
      to: monthRange.to,
    },
    { refetchOnMountOrArgChange: true },
  )

  const daySummary = calendarQuery.data?.days ?? {}
  const events = calendarQuery.data?.events ?? []

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return []
    const key = selectedDay.format('YYYY-MM-DD')
    return events.filter((event) => event.date === key)
  }, [events, selectedDay])

  const handleDayClick = useCallback((day) => {
    setSelectedDay(day)
  }, [])

  return (
    <Stack spacing={2}>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {Object.entries(CALENDAR_EVENT_META).map(([type, meta]) => (
          <Chip
            key={type}
            size="small"
            label={meta.label}
            sx={{
              bgcolor: `${meta.color}22`,
              color: meta.color,
              fontWeight: 600,
            }}
          />
        ))}
      </Stack>

      {calendarQuery.isError ? (
        <Alert severity="error">
          {getApiErrorMessage(calendarQuery.error, 'Kalendarni yuklab bo‘lmadi')}
        </Alert>
      ) : null}

      <Grid container spacing={2.5} sx={{ alignItems: 'stretch' }}>
        <Grid size={{ xs: 12, lg: 8 }}>
          <Box
            sx={{
              p: { xs: 1, sm: 2 },
              position: 'relative',
              borderRadius: 2,
              bgcolor: 'background.paper',
              border: 1,
              borderColor: 'divider',
            }}
          >
            {calendarQuery.isLoading && !calendarQuery.data ? (
              <Box sx={{ py: 12, display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            ) : (
              <DateCalendar
                value={selectedDay}
                referenceDate={visibleMonth}
                onChange={(value) => handleDayClick(value)}
                onMonthChange={(month) => setVisibleMonth(month)}
                showDaysOutsideCurrentMonth
                reduceAnimations
                slots={{ day: CalendarEventDay }}
                slotProps={{
                  day: {
                    daySummary,
                    onDayClick: handleDayClick,
                  },
                }}
                sx={{
                  width: '100%',
                  maxWidth: 'none',
                  height: 'auto',
                  maxHeight: 'none',
                  '& .MuiDateCalendar-viewTransitionContainer': {
                    overflow: 'visible',
                  },
                  '& .MuiDayCalendar-slideTransition': {
                    minHeight: { xs: 56 * 6, md: 72 * 6 },
                    overflow: 'visible',
                  },
                  '& .MuiDayCalendar-monthContainer': {
                    overflow: 'visible',
                  },
                  '& .MuiPickersCalendarHeader-root': {
                    pl: 2,
                    pr: 2,
                    mb: 1,
                  },
                  '& .MuiPickersCalendarHeader-label': {
                    fontSize: { xs: '1.1rem', md: '1.35rem' },
                    fontWeight: 700,
                  },
                  '& .MuiDayCalendar-header': {
                    justifyContent: 'space-around',
                  },
                  '& .MuiDayCalendar-weekContainer': {
                    justifyContent: 'space-around',
                  },
                  '& .MuiDayCalendar-weekDayLabel': {
                    width: { xs: 44, sm: 52, md: 72 },
                    fontSize: { xs: '0.8rem', md: '0.95rem' },
                    fontWeight: 700,
                  },
                  '& .MuiPickerDay-root': {
                    width: { xs: 44, sm: 52, md: 72 },
                    height: { xs: 44, sm: 52, md: 72 },
                    fontSize: { xs: '0.95rem', md: '1.15rem' },
                  },
                }}
              />
            )}

            {calendarQuery.isFetching && calendarQuery.data ? (
              <CircularProgress size={22} sx={{ position: 'absolute', top: 12, right: 12 }} />
            ) : null}
          </Box>
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <Box sx={{ minHeight: { xs: 280, lg: '100%' } }}>
            <CalendarDayEventsPanel
              date={selectedDay}
              events={selectedDayEvents}
              onNavigate={onNavigate}
            />
          </Box>
        </Grid>
      </Grid>
    </Stack>
  )
}
