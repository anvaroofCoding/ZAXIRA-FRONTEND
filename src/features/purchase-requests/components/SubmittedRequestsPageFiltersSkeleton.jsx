import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SkeletonBlock } from '@/shared/components/skeleton'

const SearchFieldSkeleton = () => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      px: 1.5,
      height: 40,
      border: 1,
      borderColor: 'divider',
      borderRadius: 1,
      bgcolor: 'background.paper',
      width: '100%',
    }}
  >
    <SkeletonBlock variant="circular" width={20} height={20} />
    <SkeletonBlock variant="text" height={18} sx={{ flex: 1, maxWidth: 72 }} />
  </Box>
)

const SelectFieldSkeleton = () => (
  <SkeletonBlock
    variant="rounded"
    height={40}
    sx={{ width: '100%', borderRadius: 1 }}
  />
)

export const SubmittedRequestsPageFiltersSkeleton = () => (
  <Stack spacing={1.5}>
    <Grid container spacing={1.5} sx={{ alignItems: 'center' }}>
      <Grid size={{ xs: 12, md: 4 }}>
        <SearchFieldSkeleton />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <SelectFieldSkeleton />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
        <SelectFieldSkeleton />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
        <SelectFieldSkeleton />
      </Grid>
    </Grid>
  </Stack>
)
