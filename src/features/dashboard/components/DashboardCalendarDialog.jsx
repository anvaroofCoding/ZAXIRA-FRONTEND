import { useCallback, useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
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

const CalendarDayEventsDialog = ({ open, date, events = [], onClose, onNavigate }) => {
  const dateLabel = date ? formatDateOnly(date) : '—'

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{dateLabel} — hodisalar</DialogTitle>
      <DialogContent dividers>
        {!events.length ? (
          <Typography variant="body2" color="text.secondary">
            Bu kunda rejalashtirilgan hodisalar yo‘q.
          </Typography>
        ) : (
          <List disablePadding>
            {events.map((event) => {
              const meta = CALENDAR_EVENT_META[event.type] ?? {
                label: event.type,
                color: 'text.secondary',
              }

              return (
                <ListItem key={event.id} disablePadding sx={{ mb: 1 }}>
                  <ListItemButton
                    onClick={() => onNavigate(event)}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      alignItems: 'flex-start',
                    }}
                  >
                    <ListItemText
                      primary={
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="subtitle2" fontWeight={700}>
                            {event.title}
                          </Typography>
                          <Chip
                            size="small"
                            label={meta.label}
                            sx={{
                              bgcolor: `${meta.color}22`,
                              color: meta.color,
                              fontWeight: 600,
                            }}
                          />
                          {event.mandatory ? (
                            <Chip size="small" color="warning" label="Majburiy" />
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
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Yopish</Button>
      </DialogActions>
    </Dialog>
  )
}

export const DashboardCalendarDialog = ({ open, onClose, structureId, onNavigate }) => {
  const [visibleMonth, setVisibleMonth] = useState(() => dayjs())
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayEventsOpen, setDayEventsOpen] = useState(false)

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
    { skip: !open },
  )

  useEffect(() => {
    if (!open) {
      setSelectedDay(null)
      setDayEventsOpen(false)
      setVisibleMonth(dayjs())
    }
  }, [open])

  const daySummary = calendarQuery.data?.days ?? {}
  const events = calendarQuery.data?.events ?? []

  const selectedDayEvents = useMemo(() => {
    if (!selectedDay) return []
    const key = selectedDay.format('YYYY-MM-DD')
    return events.filter((event) => event.date === key)
  }, [events, selectedDay])

  const handleDayClick = useCallback((day) => {
    setSelectedDay(day)
    setDayEventsOpen(true)
  }, [])

  const handleNavigate = (event) => {
    onNavigate(event.navigatePath)
    setDayEventsOpen(false)
    onClose()
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="lg"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { overflow: 'visible' },
        }}
      >
        <DialogTitle>Kalendar</DialogTitle>
        <DialogContent
          dividers
          sx={{
            overflow: 'visible',
            overflowY: 'visible',
            maxHeight: 'none',
            flex: '0 0 auto',
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
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

            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                justifyContent: 'center',
                py: 1,
                overflow: 'visible',
              }}
            >
              {calendarQuery.isLoading && !calendarQuery.data ? (
                <Box sx={{ py: 10, display: 'flex', justifyContent: 'center', width: '100%' }}>
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
                    maxWidth: 560,
                    height: 'auto',
                    maxHeight: 'none',
                    mx: 'auto',
                    '& .MuiDateCalendar-viewTransitionContainer': {
                      overflow: 'visible',
                    },
                    '& .MuiDayCalendar-slideTransition': {
                      minHeight: 56 * 6,
                      overflow: 'visible',
                    },
                    '& .MuiDayCalendar-monthContainer': {
                      overflow: 'visible',
                    },
                    '& .MuiPickersCalendarHeader-root': {
                      pl: 2,
                      pr: 2,
                    },
                    '& .MuiDayCalendar-header': {
                      justifyContent: 'space-around',
                    },
                    '& .MuiDayCalendar-weekContainer': {
                      justifyContent: 'space-around',
                    },
                    '& .MuiPickerDay-root': {
                      width: 52,
                      height: 52,
                      fontSize: '1.05rem',
                    },
                  }}
                />
              )}

              {calendarQuery.isFetching && calendarQuery.data ? (
                <CircularProgress
                  size={22}
                  sx={{ position: 'absolute', top: 8, right: 8 }}
                />
              ) : null}
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Yopish</Button>
        </DialogActions>
      </Dialog>

      <CalendarDayEventsDialog
        open={dayEventsOpen}
        date={selectedDay}
        events={selectedDayEvents}
        onClose={() => setDayEventsOpen(false)}
        onNavigate={handleNavigate}
      />
    </>
  )
}
