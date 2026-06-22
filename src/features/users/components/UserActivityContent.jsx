import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import {
  useGetUserActivityQuery,
  useGetUserLastDeviceQuery,
} from '@/features/users/api/usersApi'
import { UserActivityStats } from '@/features/users/components/UserActivityStats'
import { UserActivityTimeline } from '@/features/users/components/UserActivityTimeline'
import { UserDeviceTelemetryPanel } from '@/features/users/components/UserDeviceTelemetryPanel'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const UserActivityContent = ({ user }) => {
  const activityQuery = useGetUserActivityQuery(
    { userId: user?.id, page: 1, limit: 100 },
    { skip: !user?.id },
  )
  const deviceQuery = useGetUserLastDeviceQuery(user?.id, {
    skip: !user?.id,
    pollingInterval: 15000,
  })

  const events = activityQuery.data?.items ?? []
  const isLoading = activityQuery.isLoading || activityQuery.isUninitialized

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (activityQuery.isError) {
    return (
      <Alert severity="error">
        {getApiErrorMessage(activityQuery.error, 'Faollik tarixini yuklab bo‘lmadi')}
      </Alert>
    )
  }

  return (
    <Stack spacing={3}>
      <UserActivityStats
        events={events}
        user={{ ...user, isOnline: deviceQuery.data?.isOnline ?? user?.isOnline }}
        device={deviceQuery.data}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
          gap: 2,
          alignItems: 'start',
        }}
      >
        <Stack spacing={2} sx={{ minWidth: 0 }}>
          <Typography variant="h6" fontWeight={600}>
            Voqealar tarixi
          </Typography>
          <UserActivityTimeline events={events} />
        </Stack>

        <Stack spacing={2} sx={{ minWidth: 0, position: { lg: 'sticky' }, top: { lg: 16 } }}>
          <Typography variant="h6" fontWeight={600}>
            Qurilma analitikasi
          </Typography>
          <UserDeviceTelemetryPanel
            device={deviceQuery.data}
            loading={deviceQuery.isLoading || deviceQuery.isFetching}
            layout="page"
          />
        </Stack>
      </Box>
    </Stack>
  )
}
