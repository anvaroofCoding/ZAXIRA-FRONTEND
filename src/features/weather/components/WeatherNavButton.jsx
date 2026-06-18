import { useState } from 'react'
import Badge from '@mui/material/Badge'
import WbCloudyOutlinedIcon from '@mui/icons-material/WbCloudyOutlined'
import IconButton from '@mui/material/IconButton'
import { useGetTashkentWeatherQuery } from '@/features/weather/api/weatherApi'
import { formatTemperature } from '@/features/weather/utils/weatherMeta'
import { WeatherModal } from './WeatherModal'

export const WeatherNavButton = () => {
  const [open, setOpen] = useState(false)
  const weatherQuery = useGetTashkentWeatherQuery(undefined, {
    pollingInterval: 600000,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  })
  const temperatureLabel = formatTemperature(weatherQuery.data?.current?.temperature_2m)
  const showTemperature = temperatureLabel !== '—'

  return (
    <>
      <IconButton color="inherit" aria-label="Ob-havo" onClick={() => setOpen(true)}>
        <Badge
          badgeContent={showTemperature ? temperatureLabel : null}
          color="error"
          overlap="circular"
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          sx={{
            '& .MuiBadge-badge': {
              minWidth: 24,
              height: 18,
              px: 0.5,
              fontSize: '0.65rem',
              fontWeight: 700,
            },
          }}
        >
          <WbCloudyOutlinedIcon />
        </Badge>
      </IconButton>

      <WeatherModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
