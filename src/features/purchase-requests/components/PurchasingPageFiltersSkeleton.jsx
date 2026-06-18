import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SkeletonBlock } from '@/shared/components/skeleton'

export const PurchasingPageFiltersSkeleton = ({ withStructureFilter = true }) => (
  <Stack spacing={2}>
    <Stack spacing={0.75}>
      <SkeletonBlock variant="text" width={220} height={28} />
      <SkeletonBlock variant="text" width={{ xs: '92%', sm: 520 }} height={18} />
    </Stack>

    <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
      <Grid size={{ xs: 12, md: withStructureFilter ? 4 : 5 }}>
        <SkeletonBlock variant="rounded" height={40} />
      </Grid>

      {withStructureFilter ? (
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SkeletonBlock variant="rounded" height={40} />
        </Grid>
      ) : null}

      <Grid size={{ xs: 12, sm: 6, md: withStructureFilter ? 2.5 : 3.5 }}>
        <SkeletonBlock variant="rounded" height={40} />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: withStructureFilter ? 2.5 : 3.5 }}>
        <SkeletonBlock variant="rounded" height={40} />
      </Grid>
    </Grid>
  </Stack>
)
