import { useState } from 'react'
import WbSunnyOutlinedIcon from '@mui/icons-material/WbSunnyOutlined'
import IconButton from '@mui/material/IconButton'
import { WeatherModal } from './WeatherModal'

export const WeatherNavButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <IconButton color="inherit" aria-label="Ob-havo" onClick={() => setOpen(true)}>
        <WbSunnyOutlinedIcon />
      </IconButton>

      <WeatherModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
