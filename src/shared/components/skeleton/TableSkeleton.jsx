import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import { SkeletonBlock } from './SkeletonBlock'

export const TableSkeleton = ({ rows = 6, columns = 5 }) => (
  <Box aria-busy="true" aria-label="Jadval yuklanmoqda">
    <SkeletonBlock variant="text" width={200} height={36} sx={{ mb: 2.5 }} />

    <Stack
      direction="row"
      spacing={1}
      sx={{ mb: 1.5, px: 0.5 }}
    >
      {Array.from({ length: columns }).map((_, index) => (
        <SkeletonBlock
          key={`head-${index}`}
          height={18}
          width={`${100 / columns}%`}
        />
      ))}
    </Stack>

    <Stack spacing={1}>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Stack key={rowIndex} direction="row" spacing={1}>
          {Array.from({ length: columns }).map((__, colIndex) => (
            <SkeletonBlock
              key={`${rowIndex}-${colIndex}`}
              height={40}
              width={`${100 / columns}%`}
            />
          ))}
        </Stack>
      ))}
    </Stack>
  </Box>
)
