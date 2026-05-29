import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SkeletonBlock } from './SkeletonBlock'

export const PageContentSkeleton = ({ lines = 4 }) => (
  <Box aria-busy="true" aria-label="Sahifa yuklanmoqda">
    <SkeletonBlock variant="text" width={220} height={36} sx={{ mb: 2.5 }} />

    <Stack spacing={1.25} sx={{ mb: 3 }}>
      {Array.from({ length: lines }).map((_, index) => (
        <SkeletonBlock
          key={index}
          height={14}
          width={index === lines - 1 ? '72%' : '100%'}
        />
      ))}
    </Stack>

    <SkeletonBlock height={180} />
  </Box>
)
