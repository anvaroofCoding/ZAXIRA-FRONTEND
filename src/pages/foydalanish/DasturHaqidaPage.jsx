import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import { useGetAppAboutQuery, useGetAppGuidesQuery } from '@/features/app-usage/api/appUsageApi'
import { AppAboutHero } from '@/features/app-usage/components/AppAboutHero'
import { AppGuidesSection } from '@/features/app-usage/components/AppGuidesSection'
import { GuideAdminPanel } from '@/features/app-usage/components/GuideAdminPanel'
import {
  DEFAULT_APP_ABOUT,
  isAppUsageQueryUnavailable,
} from '@/features/app-usage/constants/defaultAppAbout'
import { isPrivilegedAdminUser } from '@/features/auth/utils/isPrivilegedAdminUser'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const DasturHaqidaPageSkeleton = () => (
  <Stack spacing={2}>
    <Box>
      <Skeleton variant="text" width="45%" height={44} />
      <Skeleton variant="text" width="70%" />
    </Box>

    <Paper variant="outlined" sx={{ p: { xs: 2, md: 2.5 } }}>
      <Stack spacing={1.25}>
        <Skeleton variant="text" width="35%" />
        <Skeleton variant="rounded" height={88} />
      </Stack>
    </Paper>

    <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 } }}>
      <Stack spacing={1.5}>
        <Skeleton variant="text" width="40%" height={34} />
        <Skeleton variant="rounded" height={156} />
      </Stack>
    </Paper>
  </Stack>
)

export const DasturHaqidaPage = () => {
  const { user } = usePermissions()
  const isAdmin = isPrivilegedAdminUser(user)

  const aboutQuery = useGetAppAboutQuery()
  const guidesQuery = useGetAppGuidesQuery()

  const apiMissing =
    !aboutQuery.isFetching &&
    !guidesQuery.isFetching &&
    isAppUsageQueryUnavailable(aboutQuery) &&
    isAppUsageQueryUnavailable(guidesQuery)

  const loading =
    (aboutQuery.isLoading || guidesQuery.isLoading) &&
    !aboutQuery.data &&
    !guidesQuery.data &&
    !apiMissing

  const about = aboutQuery.data ?? DEFAULT_APP_ABOUT
  const guides = guidesQuery.data ?? []

  const blockingError =
    aboutQuery.error && !apiMissing && !aboutQuery.data
      ? aboutQuery.error
      : guidesQuery.error && !apiMissing && !guidesQuery.data
        ? guidesQuery.error
        : null

  if (loading) {
    return <DasturHaqidaPageSkeleton />
  }

  return (
    <Box>
      <Stack spacing={2}>
        {apiMissing ? (
          <Alert severity="warning">
            Backendda «app-usage» moduli hali yoqilmagan. Sahifa vaqtincha standart ma’lumot bilan
            ko‘rsatilmoqda. Serverni yangi kod bilan qayta ishga tushiring.
          </Alert>
        ) : null}

        {blockingError ? (
          <Alert severity="error">
            {getApiErrorMessage(blockingError, 'Ma’lumotlarni yuklashda xatolik')}
          </Alert>
        ) : null}

        <AppAboutHero about={about} />
        <AppGuidesSection guides={guides} loading={guidesQuery.isFetching && !apiMissing} />
        {isAdmin && !apiMissing ? <GuideAdminPanel /> : null}
      </Stack>
    </Box>
  )
}
