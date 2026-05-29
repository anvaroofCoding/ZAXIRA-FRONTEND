import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SkeletonBlock } from './SkeletonBlock'

export const DashboardSkeleton = () => (
  <Box aria-busy="true" aria-label="Dashboard yuklanmoqda">
    <SkeletonBlock variant="text" width={180} height={36} sx={{ mb: 3 }} />

    <Grid container spacing={2} sx={{ mb: 3 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 3 }}>
          <SkeletonBlock height={88} />
        </Grid>
      ))}
    </Grid>

    <Grid container spacing={2}>
      <Grid size={{ xs: 12, md: 8 }}>
        <SkeletonBlock height={280} />
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <Stack spacing={2}>
          <SkeletonBlock height={120} />
          <SkeletonBlock height={120} />
        </Stack>
      </Grid>
    </Grid>
  </Box>
)
