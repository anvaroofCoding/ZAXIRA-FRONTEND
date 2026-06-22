import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import VpnKeyIcon from '@mui/icons-material/VpnKey'
import WifiIcon from '@mui/icons-material/Wifi'
import WifiOffIcon from '@mui/icons-material/WifiOff'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDateOnly, formatDateTime } from '@/shared/utils/formatDate'

const EVENT_CONFIG = {
  login: { label: 'Tizimga kirdi', color: 'success', Icon: LoginIcon },
  logout: { label: 'Tizimdan chiqdi', color: 'warning', Icon: LogoutIcon },
  online: { label: 'Kun davomida onlayn', color: 'success', Icon: WifiIcon },
  offline: { label: 'Onlayndan chiqdi', color: 'default', Icon: WifiOffIcon },
  override_login: { label: 'Admin orqali kirildi', color: 'info', Icon: VpnKeyIcon },
}

const getEventConfig = (eventType) =>
  EVENT_CONFIG[eventType] ?? { label: eventType, color: 'default', Icon: WifiOffIcon }

const DetailItem = ({ label, value }) => {
  if (!value) return null

  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
        {value}
      </Typography>
    </Box>
  )
}

export const UserActivityTimeline = ({ events }) => {
  if (!events.length) {
    return (
      <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">Hozircha faollik yozuvlari yo‘q</Typography>
      </Paper>
    )
  }

  return (
    <Stack spacing={1.5}>
      {events.map((event, index) => {
        const config = getEventConfig(event.eventType)
        const EventIcon = config.Icon
        const order = events.length - index

        return (
          <Paper key={event.id} variant="outlined" sx={{ p: 2 }}>
            <Stack spacing={1.5}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'action.hover',
                      flexShrink: 0,
                    }}
                  >
                    <EventIcon sx={{ fontSize: 18 }} />
                  </Box>
                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                      <Typography variant="subtitle1" fontWeight={600}>
                        {config.label}
                      </Typography>
                      <Chip size="small" label={`#${order}`} variant="outlined" />
                    </Stack>
                  </Box>
                </Stack>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}
                >
                  {event.eventType === 'online'
                    ? formatDateOnly(event.createdAt)
                    : formatDateTime(event.createdAt)}
                </Typography>
              </Stack>

              <Divider />

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
                  gap: 2,
                }}
              >
                <DetailItem label="Qurilma" value={event.deviceName || '—'} />
                <DetailItem label="IP manzil" value={event.ipAddress || '—'} />
                <DetailItem
                  label="Admin"
                  value={
                    event.actor
                      ? `${event.actor.displayName} (@${event.actor.login})`
                      : null
                  }
                />
                <DetailItem label="Qurilma ID" value={event.deviceId || null} />
              </Box>

              {event.userAgent ? (
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1,
                    bgcolor: 'action.hover',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                    Brauzer
                  </Typography>
                  <Typography variant="caption" sx={{ wordBreak: 'break-word', display: 'block' }}>
                    {event.userAgent}
                  </Typography>
                </Box>
              ) : null}
            </Stack>
          </Paper>
        )
      })}
    </Stack>
  )
}
