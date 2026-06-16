import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { ThemeColorPicker } from '@/features/settings/components/ThemeColorPicker'
import { StatusColorPicker } from '@/features/settings/components/StatusColorPicker'
import { InternetSpeedCard } from '@/features/settings/components/InternetSpeedCard'
import { useUserPreferences } from '@/shared/hooks/useUserPreferences'

const SettingRow = ({ title, description, checked, onChange }) => (
  <ListItem
    secondaryAction={
      <Switch edge="end" checked={checked} onChange={(_, value) => onChange(value)} />
    }
    disablePadding
  >
    <ListItemText primary={title} secondary={description} />
  </ListItem>
)

export const SettingsContent = () => {
  const {
    notificationToast,
    chatToast,
    setNotificationToast,
    setChatToast,
  } = useUserPreferences()

  return (
    <Stack spacing={3} divider={<Divider />}>
      <ThemeColorPicker />

      <InternetSpeedCard embedded />

      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Real vaqt bildirishnomalari
        </Typography>
        <List disablePadding>
          <SettingRow
            title="Bildirishnoma toastlari"
            description="Yangi tizim bildirishnomalari kelganda ekranda bir marta toast ko‘rsatish."
            checked={notificationToast}
            onChange={setNotificationToast}
          />
          <SettingRow
            title="Chat toastlari"
            description="Chatda yangi xabar kelganda ekranda toast ko‘rsatish."
            checked={chatToast}
            onChange={setChatToast}
          />
        </List>
      </Box>

      <StatusColorPicker />
    </Stack>
  )
}
