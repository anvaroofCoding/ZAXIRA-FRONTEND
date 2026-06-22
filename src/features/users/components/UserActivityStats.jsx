import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatLastOnline } from '@/shared/utils/formatLastOnline'

const StatCard = ({ label, value, subvalue }) => (
  <Paper
    variant="outlined"
    sx={{
      p: 2,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: 0.5,
    }}
  >
    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
      {label}
    </Typography>
    <Typography variant="h5" component="p" fontWeight={700} sx={{ lineHeight: 1.2 }}>
      {value}
    </Typography>
    {subvalue ? (
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
        {subvalue}
      </Typography>
    ) : null}
  </Paper>
)

export const UserActivityStats = ({ events, user, device }) => {
  const loginCount = events.filter((e) => e.eventType === 'login' || e.eventType === 'override_login').length
  const logoutCount = events.filter((e) => e.eventType === 'logout').length
  const offlineCount = events.filter((e) => e.eventType === 'offline').length
  const onlineDaysCount = events.filter((e) => e.eventType === 'online').length
  const isOnline = device?.isOnline ?? user?.isOnline

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, 1fr)',
          lg: 'repeat(4, 1fr)',
        },
        gap: 1.5,
      }}
    >
      <StatCard
        label="Holat"
        value={isOnline ? 'Onlayn' : 'Oflayn'}
        subvalue={
          isOnline
            ? 'Hozir tizimda faol'
            : `Oxirgi faollik: ${formatLastOnline(user?.lastOnline) || formatDateTime(user?.lastOnline) || '—'}`
        }
      />
      <StatCard
        label="Kirishlar"
        value={loginCount}
        subvalue={`Oxirgi: ${formatDateTime(user?.lastLoginAt)}`}
      />
      <StatCard label="Chiqishlar" value={logoutCount} subvalue="Tizimdan chiqish" />
      <StatCard
        label="Jami voqealar"
        value={events.length}
        subvalue={`Onlayn kunlar: ${onlineDaysCount} · Onlayndan chiqish: ${offlineCount}`}
      />
    </Box>
  )
}
