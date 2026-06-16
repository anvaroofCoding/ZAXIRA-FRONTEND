import { useMemo } from 'react'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import AirIcon from '@mui/icons-material/Air'
import CompressIcon from '@mui/icons-material/Compress'
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useGetTashkentWeatherQuery } from '@/features/weather/api/weatherApi'
import {
  formatForecastDayLabel,
  formatTemperature,
  formatTemperatureWithUnit,
  formatWeatherDate,
  getWeatherMeta,
} from '@/features/weather/utils/weatherMeta'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const DETAIL_URL = 'https://open-meteo.com/en/docs'

const MetricItem = ({ icon: Icon, label, value }) => (
  <Stack spacing={0.5} sx={{ alignItems: 'center', flex: 1, minWidth: 0 }}>
    <Icon sx={{ fontSize: 18, color: 'text.secondary' }} />
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={700}>
      {value}
    </Typography>
  </Stack>
)

const ForecastRow = ({ dayLabel, max, min, Icon }) => (
  <Stack
    direction="row"
    spacing={1.5}
    sx={{
      alignItems: 'center',
      py: 0.75,
    }}
  >
    <Typography variant="body2" sx={{ width: 92, flexShrink: 0 }}>
      {dayLabel}
    </Typography>
    <Icon sx={{ fontSize: 22, color: 'warning.main' }} />
    <Box sx={{ flex: 1 }} />
    <Typography variant="body2" fontWeight={700}>
      {formatTemperature(max)}
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ width: 28, textAlign: 'right' }}>
      {formatTemperature(min)}
    </Typography>
  </Stack>
)

export const WeatherModal = ({ open, onClose }) => {
  const weatherQuery = useGetTashkentWeatherQuery(undefined, {
    skip: !open,
    refetchOnMountOrArgChange: true,
  })

  const weatherView = useMemo(() => {
    const payload = weatherQuery.data
    if (!payload?.current || !payload?.daily) return null

    const today = payload.daily.time?.[0]
    const { dayLabel, dateLabel } = formatWeatherDate(today)
    const currentMeta = getWeatherMeta(payload.current.weather_code)
    const CurrentIcon = currentMeta.Icon

    const forecast = (payload.daily.time ?? [])
      .slice(0, 5)
      .map((date, index) => {
        const meta = getWeatherMeta(payload.daily.weather_code?.[index])
        return {
          id: date,
          dayLabel: formatForecastDayLabel(date, index),
          max: payload.daily.temperature_2m_max?.[index],
          min: payload.daily.temperature_2m_min?.[index],
          Icon: meta.Icon,
        }
      })

    return {
      dayLabel,
      dateLabel,
      currentMeta,
      CurrentIcon,
      temperature: formatTemperatureWithUnit(payload.current.temperature_2m),
      humidity:
        payload.current.relative_humidity_2m !== undefined
          ? `${Math.round(payload.current.relative_humidity_2m)}%`
          : '—',
      wind:
        payload.current.wind_speed_10m !== undefined
          ? `${Math.round(payload.current.wind_speed_10m)} km/soat`
          : '—',
      pressure:
        payload.current.surface_pressure !== undefined
          ? `${Math.round(payload.current.surface_pressure)} hPa`
          : '—',
      forecast,
    }
  }, [weatherQuery.data])

  const handleOpenDetails = () => {
    window.open(DETAIL_URL, '_blank', 'noopener,noreferrer')
  }

  const CurrentIcon = weatherView?.CurrentIcon

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      scroll="paper"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          },
        },
      }}
    >
      <Box sx={{ px: 3, pt: 3, pb: 2.5 }}>
        <Stack spacing={2.5}>
          <Stack spacing={0.5}>
            <Stack
              direction="row"
              sx={{ justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Typography variant="body2" color="text.secondary">
                Bugun
              </Typography>
              <CalendarMonthOutlinedIcon
                sx={{ color: 'text.secondary', fontSize: 22, flexShrink: 0 }}
              />
            </Stack>
            <Typography variant="h5" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {weatherView?.dateLabel ?? '—'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {weatherView?.dayLabel ?? '—'}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center' }}>
            <Typography variant="body1" fontWeight={600}>
              Toshkent, O‘zbekiston
            </Typography>
            <LocationOnOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          </Stack>

          {weatherQuery.isLoading ? (
            <Stack spacing={2} sx={{ alignItems: 'center', py: 4 }}>
              <CircularProgress size={28} />
              <Typography variant="body2" color="text.secondary">
                Ob-havo yuklanmoqda...
              </Typography>
            </Stack>
          ) : null}

          {weatherQuery.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(weatherQuery.error, 'Ob-havo ma’lumotini yuklab bo‘lmadi')}
            </Alert>
          ) : null}

          {weatherView && CurrentIcon ? (
            <>
              <Stack spacing={1} sx={{ alignItems: 'center', py: 1 }}>
                <Box
                  sx={{
                    width: 96,
                    height: 96,
                    borderRadius: '50%',
                    display: 'grid',
                    placeItems: 'center',
                    background:
                      'linear-gradient(180deg, rgba(255, 193, 7, 0.18) 0%, rgba(33, 150, 243, 0.08) 100%)',
                  }}
                >
                  <CurrentIcon sx={{ fontSize: 56, color: 'warning.main' }} />
                </Box>
                <Typography variant="h2" fontWeight={800} sx={{ lineHeight: 1 }}>
                  {weatherView.temperature}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {weatherView.currentMeta.label}
                </Typography>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{
                  px: 1,
                  py: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                }}
              >
                <MetricItem
                  icon={WaterDropOutlinedIcon}
                  label="Namlik"
                  value={weatherView.humidity}
                />
                <MetricItem icon={AirIcon} label="Shamol" value={weatherView.wind} />
                <MetricItem icon={CompressIcon} label="Bosim" value={weatherView.pressure} />
              </Stack>

              <Divider />

              <Stack spacing={0.25}>
                {weatherView.forecast.map((item) => (
                  <ForecastRow
                    key={item.id}
                    dayLabel={item.dayLabel}
                    max={item.max}
                    min={item.min}
                    Icon={item.Icon}
                  />
                ))}
              </Stack>

              <Button
                onClick={handleOpenDetails}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  alignSelf: 'flex-start',
                  px: 0,
                  minWidth: 0,
                  textTransform: 'none',
                  fontWeight: 600,
                }}
              >
                Batafsil ma’lumot
              </Button>
            </>
          ) : null}
        </Stack>
      </Box>
    </Dialog>
  )
}
