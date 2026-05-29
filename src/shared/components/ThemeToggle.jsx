import IconButton from '@mui/material/IconButton'
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined'
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined'
import { useColorMode } from '@/shared/hooks/useColorMode'

export const ThemeToggle = ({ sx }) => {
  const { mode, toggleMode } = useColorMode()

  return (
    <IconButton
      onClick={toggleMode}
      aria-label={mode === 'dark' ? 'Yorug‘ rejim' : 'Qorong‘u rejim'}
      sx={{ color: 'common.white', ...sx }}
    >
      {mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
    </IconButton>
  )
}
