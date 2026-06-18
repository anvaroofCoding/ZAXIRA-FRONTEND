import { useState } from 'react'
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined'
import IconButton from '@mui/material/IconButton'
import { SettingsModal } from './SettingsModal'

export const SettingsNavButton = () => {
  const [open, setOpen] = useState(false)

  return (
    <>
      <IconButton color="inherit" aria-label="Sozlamalar" onClick={() => setOpen(true)}>
        <SettingsOutlinedIcon />
      </IconButton>

      <SettingsModal open={open} onClose={() => setOpen(false)} />
    </>
  )
}
