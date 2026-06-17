import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useTheme } from '@mui/material/styles'
import { SkeletonBlock } from '@/shared/components/skeleton'

const SUMMARY_CARD_COUNT = 3
const Y_AXIS_TICK_COUNT = 5
const X_AXIS_TICK_COUNT = 6

export const DashboardHeaderSkeleton = () => (
  <Stack spacing={2} sx={{ mb: 2 }}>
    <SkeletonBlock variant="text" width={120} height={32} />

    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.25}
      sx={{ alignItems: { xs: 'stretch', sm: 'center' }, flexWrap: 'wrap', gap: 1 }}
    >
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, flex: { sm: 1 } }}>
        <SkeletonBlock variant="rounded" width={132} height={36} />
        <SkeletonBlock variant="rounded" width={104} height={36} />
        <SkeletonBlock variant="rounded" width={118} height={36} />
        <SkeletonBlock variant="rounded" width={84} height={36} />
      </Stack>
      <SkeletonBlock
        variant="rounded"
        width="100%"
        height={40}
        sx={{ maxWidth: { sm: 260 }, flexShrink: 0 }}
      />
    </Stack>
  </Stack>
)

export const DashboardSummaryCardSkeleton = () => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ py: 2.25 }}>
      <Stack
        direction="row"
        gap={1.5}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
          <SkeletonBlock variant="text" width="42%" height={20} />
          <SkeletonBlock variant="text" width="55%" height={36} sx={{ mt: 0.25 }} />
        </Box>
    <SkeletonBlock
      variant="rounded"
      width={120}
      height={44}
      sx={{
        mt: 0.25,
        ml: 2,
        flexShrink: 0,
        width: { xs: 88, sm: 120 },
        height: { xs: 40, sm: 44 },
      }}
    />
      </Stack>
    </CardContent>
  </Card>
)

export const DashboardDateNavSkeleton = () => (
  <Stack
    direction="row"
    spacing={0.25}
    sx={{
      mb: 1,
      alignItems: 'center',
      width: 'fit-content',
      maxWidth: '100%',
    }}
  >
    <SkeletonBlock variant="circular" width={28} height={28} />
    <SkeletonBlock variant="rounded" width={168} height={20} />
    <SkeletonBlock variant="circular" width={28} height={28} />
  </Stack>
)

const ChartAreaPlaceholder = () => {
  const theme = useTheme()

  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        borderRadius: 1,
        bgcolor: 'action.hover',
      }}
    >
      <Box
        component="svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          color: theme.palette.primary.main,
        }}
      >
        <path
          d="M0,100 L0,96 L62,96 L70,22 L100,22 L100,100 Z"
          fill="currentColor"
          opacity={0.14}
        />
        <path
          d="M0,96 L62,96 L70,22 L100,22"
          fill="none"
          stroke="currentColor"
          strokeWidth={0.6}
          opacity={0.22}
          vectorEffect="non-scaling-stroke"
        />
      </Box>
      <SkeletonBlock
        variant="rounded"
        animation="wave"
        sx={{
          position: 'absolute',
          inset: 0,
          height: '100%',
          opacity: 0.35,
          borderRadius: 1,
        }}
      />
    </Box>
  )
}

export const DashboardChartSkeleton = () => (
  <Card variant="outlined" sx={{ width: '100%' }}>
    <CardContent sx={{ py: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <SkeletonBlock variant="rounded" width={28} height={3} />
          <SkeletonBlock variant="text" width={128} height={18} />
        </Stack>
      </Box>

      <Box sx={{ height: { xs: 280, sm: 360, md: 440 }, width: '100%', minWidth: 0, display: 'flex' }}>
        <Stack
          spacing={0}
          sx={{
            width: 72,
            flexShrink: 0,
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            pr: 1,
            pt: 2.5,
            pb: 4.5,
          }}
        >
          {Array.from({ length: Y_AXIS_TICK_COUNT }).map((_, index) => (
            <SkeletonBlock
              key={index}
              variant="text"
              width={index % 2 === 0 ? 52 : 44}
              height={14}
            />
          ))}
        </Stack>

        <Box sx={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <ChartAreaPlaceholder />

          <Stack
            direction="row"
            spacing={0}
            sx={{
              position: 'absolute',
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'space-between',
              px: 0.5,
            }}
          >
            {Array.from({ length: X_AXIS_TICK_COUNT }).map((_, index) => (
              <SkeletonBlock
                key={index}
                variant="text"
                width={index % 2 === 0 ? 72 : 64}
                height={12}
              />
            ))}
          </Stack>
        </Box>
      </Box>
    </CardContent>
  </Card>
)

export const DashboardPageSkeleton = ({ showHeader = true }) => (
  <Box aria-busy="true" aria-label="Dashboard yuklanmoqda">
    {showHeader ? <DashboardHeaderSkeleton /> : null}

    <Grid container spacing={2} sx={{ mb: 2, width: '100%', alignItems: 'stretch' }}>
      {Array.from({ length: SUMMARY_CARD_COUNT }).map((_, index) => (
        <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
          <DashboardSummaryCardSkeleton />
        </Grid>
      ))}
    </Grid>

    <Box sx={{ width: '100%' }}>
      <DashboardDateNavSkeleton />
      <DashboardChartSkeleton />
    </Box>
  </Box>
)
