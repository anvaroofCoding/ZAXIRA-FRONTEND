import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import { SkeletonBlock } from '@/shared/components/skeleton'

export const UserFormPageSkeleton = ({ mode = 'create' }) => (
  <Box
    aria-busy="true"
    aria-label={
      mode === 'edit'
        ? 'Foydalanuvchi tahrirlash yuklanmoqda'
        : 'Foydalanuvchi qo‘shish yuklanmoqda'
    }
    sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}
  >
    <Paper variant="outlined" sx={{ width: '100%', px: 2, py: 1.5 }}>
      <Stack spacing={1}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SkeletonBlock variant="rounded" width={96} height={36} />
          <SkeletonBlock variant="text" width={240} height={32} />
        </Stack>
        <SkeletonBlock variant="text" width={360} height={20} />
      </Stack>
    </Paper>

    <Paper variant="outlined" sx={{ width: '100%', p: { xs: 2, sm: 3 } }}>
      <Stack spacing={3}>
        <Stack spacing={1.5}>
          <SkeletonBlock variant="text" width={180} height={24} />
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonBlock key={index} variant="rounded" height={48} />
            ))}
          </Box>
        </Stack>

        <Stack spacing={1.5}>
          <SkeletonBlock variant="text" width={220} height={24} />
          <SkeletonBlock variant="rounded" height={280} />
        </Stack>

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <SkeletonBlock variant="rounded" width={88} height={36} />
          <SkeletonBlock variant="rounded" width={96} height={36} />
        </Stack>
      </Stack>
    </Paper>
  </Box>
)
