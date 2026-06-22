import { Navigate, useNavigate, useParams } from 'react-router-dom'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { UserActivityContent } from '@/features/users/components/UserActivityContent'
import { UsersPageSkeleton } from '@/features/users/components/UsersPageSkeleton'
import { useGetUserByIdQuery } from '@/features/users/api/usersApi'
import { USERS_PAGE_PATH } from '@/features/permissions/constants'
import { QuerySkeleton } from '@/shared/components/feedback/QuerySkeleton'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const FoydalanuvchiFaollikPage = () => {
  const navigate = useNavigate()
  const { userId } = useParams()
  const { user: authUser } = usePermissions()

  const isSuperAdmin =
    authUser?.isSuperAdmin || authUser?.role === 'SUPER_ADMIN'

  const userQuery = useGetUserByIdQuery(userId, { skip: !userId || !isSuperAdmin })

  if (!isSuperAdmin) {
    return <Navigate to={USERS_PAGE_PATH} replace />
  }

  const handleBack = () => {
    navigate(USERS_PAGE_PATH)
  }

  const isUserReady = !userQuery.isLoading && !userQuery.isUninitialized && Boolean(userQuery.data)

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Paper
        variant="outlined"
        sx={{
          px: 2,
          py: 1.5,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
        }}
      >
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={handleBack}
          sx={{ alignSelf: 'flex-start', ml: -1, minHeight: 32, py: 0.5 }}
        >
          Orqaga
        </Button>

        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography variant="h5" component="h1" fontWeight={600}>
            Faollik tarixi
          </Typography>

          {userQuery.data ? (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography variant="body2" color="text.secondary">
                Login:{' '}
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {userQuery.data.login}
                </Box>
              </Typography>

              {userQuery.data.displayName &&
              userQuery.data.displayName.trim() !== userQuery.data.login ? (
                <Typography variant="body2" color="text.secondary">
                  Ism:{' '}
                  <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                    {userQuery.data.displayName}
                  </Box>
                </Typography>
              ) : null}

              {userQuery.data.structure?.shortName ? (
                <Chip
                  size="small"
                  variant="outlined"
                  label={userQuery.data.structure.shortName}
                  title={userQuery.data.structure.fullName}
                />
              ) : null}

              <Chip
                size="small"
                color={userQuery.data.isActive ? 'success' : 'default'}
                label={userQuery.data.isActive ? 'Faol profil' : 'Nofaol profil'}
              />
            </Stack>
          ) : null}
        </Stack>
      </Paper>

      <QuerySkeleton
        isLoading={userQuery.isLoading}
        isFetching={userQuery.isFetching}
        isUninitialized={userQuery.isUninitialized}
        hasData={isUserReady}
        skeleton={<UsersPageSkeleton showAddButton={false} />}
      >
        {userQuery.isError ? (
          <Alert severity="error">
            {getApiErrorMessage(userQuery.error, 'Foydalanuvchini yuklab bo‘lmadi')}
          </Alert>
        ) : (
          <UserActivityContent user={userQuery.data} />
        )}
      </QuerySkeleton>
    </Box>
  )
}
