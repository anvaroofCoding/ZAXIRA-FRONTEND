import AcUnitIcon from '@mui/icons-material/AcUnit'
import CloudIcon from '@mui/icons-material/Cloud'
import FoggyIcon from '@mui/icons-material/Foggy'
import GrainIcon from '@mui/icons-material/Grain'
import ThunderstormIcon from '@mui/icons-material/Thunderstorm'
import WbCloudyIcon from '@mui/icons-material/WbCloudy'
import WbSunnyIcon from '@mui/icons-material/WbSunny'

const WEEKDAY_LABELS = [
  'Yakshanba',
  'Dushanba',
  'Seshanba',
  'Chorshanba',
  'Payshanba',
  'Juma',
  'Shanba',
]

const MONTH_LABELS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
]

const getWeatherGroup = (code) => {
  if (code === 0) return 'clear'
  if (code === 1) return 'mainly-clear'
  if (code === 2) return 'partly-cloudy'
  if (code === 3) return 'cloudy'
  if (code === 45 || code === 48) return 'fog'
  if (code >= 51 && code <= 57) return 'drizzle'
  if (code >= 61 && code <= 67) return 'rain'
  if (code >= 71 && code <= 77) return 'snow'
  if (code >= 80 && code <= 82) return 'rain'
  if (code >= 85 && code <= 86) return 'snow'
  if (code >= 95) return 'storm'
  return 'cloudy'
}

const WEATHER_LABELS = {
  clear: 'Ochiq osmon',
  'mainly-clear': 'Asosan ochiq',
  'partly-cloudy': 'Qisman bulutli',
  cloudy: 'Bulutli',
  fog: 'Tuman',
  drizzle: 'Mayin yomg‘ir',
  rain: 'Yomg‘ir',
  snow: 'Qor',
  storm: 'Momaqaldiroq',
}

const WEATHER_ICONS = {
  clear: WbSunnyIcon,
  'mainly-clear': WbSunnyIcon,
  'partly-cloudy': WbCloudyIcon,
  cloudy: CloudIcon,
  fog: FoggyIcon,
  drizzle: GrainIcon,
  rain: GrainIcon,
  snow: AcUnitIcon,
  storm: ThunderstormIcon,
}

export const formatWeatherDate = (value) => {
  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) {
    return { dayLabel: '—', dateLabel: '—' }
  }

  return {
    dayLabel: WEEKDAY_LABELS[date.getDay()] ?? '—',
    dateLabel: `${date.getDate()} ${MONTH_LABELS[date.getMonth()] ?? ''}, ${date.getFullYear()}`,
  }
}

export const formatForecastDayLabel = (value, index) => {
  if (index === 0) return 'Bugun'

  const date = new Date(`${value}T12:00:00`)
  if (Number.isNaN(date.getTime())) return '—'

  return WEEKDAY_LABELS[date.getDay()] ?? '—'
}

export const getWeatherMeta = (code) => {
  const group = getWeatherGroup(code)

  return {
    group,
    label: WEATHER_LABELS[group] ?? 'Noma’lum',
    Icon: WEATHER_ICONS[group] ?? CloudIcon,
  }
}

export const formatTemperature = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }

  return `${Math.round(Number(value))}°`
}

export const formatTemperatureWithUnit = (value) => {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '—'
  }

  return `${Math.round(Number(value))}°C`
}
