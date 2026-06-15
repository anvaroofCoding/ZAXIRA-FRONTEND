import NotificationsActiveOutlinedIcon from '@mui/icons-material/NotificationsActiveOutlined'
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Divider from '@mui/material/Divider'
import FormControlLabel from '@mui/material/FormControlLabel'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Typography from '@mui/material/Typography'
import { ThemeColorPicker } from '@/features/settings/components/ThemeColorPicker'
import { InternetSpeedCard } from '@/features/settings/components/InternetSpeedCard'
import { useUserPreferences } from '@/shared/hooks/useUserPreferences'

const SettingRow = ({ icon, title, description, checked, onChange }) => (
  <ListItem
    sx={{
      px: 0,
      py: 1.5,
      alignItems: 'flex-start',
    }}
  >
    <ListItemIcon sx={{ minWidth: 44, mt: 0.25, color: 'primary.main' }}>
      {icon}
    </ListItemIcon>
    <ListItemText
      slotProps={{
        primary: { component: 'div' },
        secondary: { component: 'div' },
      }}
      primary={
        <Typography variant="subtitle1" fontWeight={600}>
          {title}
        </Typography>
      }
      secondary={
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      }
    />
    <FormControlLabel
      control={<Switch checked={checked} onChange={(_, value) => onChange(value)} />}
      label=""
      sx={{ m: 0 }}
    />
  </ListItem>
)

export const SozlamalarPage = () => {
  const {
    notificationToast,
    chatToast,
    setNotificationToast,
    setChatToast,
  } = useUserPreferences()

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          width: '100%',
          px: 2,
          py: 1.5,
        }}
      >
        <Stack spacing={0.25}>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Sozlamalar
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Interfeys, internet tezligi, bildirishnomalar va chat uchun shaxsiy sozlamalar
          </Typography>
        </Stack>
      </Paper>

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <ThemeColorPicker />
        </CardContent>
      </Card>

      <InternetSpeedCard />

      <Card variant="outlined">
        <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Real vaqt bildirishnomalari
          </Typography>

          <Divider sx={{ my: 1 }} />

          <List disablePadding>
            <SettingRow
              icon={<NotificationsActiveOutlinedIcon />}
              title="Bildirishnoma toastlari"
              description="Yangi tizim bildirishnomalari kelganda ekranda bir marta toast ko‘rsatish."
              checked={notificationToast}
              onChange={setNotificationToast}
            />
            <Divider component="li" />
            <SettingRow
              icon={<ChatOutlinedIcon />}
              title="Chat toastlari"
              description="Chatda yangi xabar kelganda ekranda toast ko‘rsatish. Ochiq chat oynasidagi xabarlar uchun toast chiqmaydi."
              checked={chatToast}
              onChange={setChatToast}
            />
          </List>
        </CardContent>
      </Card>
    </Box>
  )
}
