import { useMemo } from 'react'
import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTheme } from '@mui/material/styles'

const formatCount = (value) => new Intl.NumberFormat('uz-UZ').format(value ?? 0)

const sortByQuantity = (entries) =>
  [...entries].sort((a, b) => (b.totalQuantity ?? 0) - (a.totalQuantity ?? 0))

export const OtherWarehousesVolumeCharts = ({
  structures = [],
  isLoading = false,
}) => {
  const theme = useTheme()

  const quantityChart = useMemo(() => {
    const sorted = sortByQuantity(structures)
    return {
      labels: sorted.map((entry) => entry.structure.shortName),
      values: sorted.map((entry) => entry.totalQuantity ?? 0),
    }
  }, [structures])

  const chartHeight = Math.max(220, Math.min(480, structures.length * 48 + 48))

  if (isLoading) {
    return <Skeleton variant="rounded" height={chartHeight + 72} sx={{ width: '100%' }} />
  }

  if (!structures.length) {
    return null
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, width: '100%' }}>
      <Typography variant="subtitle2" fontWeight={700}>
        Omborlar bo‘yicha tovar soni
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
        Qaysi omborda jami tovar miqdori ko‘p — ustun balandligi bo‘yicha
      </Typography>
      <Box sx={{ width: '100%', minWidth: 0, height: chartHeight, mt: 1.5 }}>
        <BarChart
          layout="horizontal"
          yAxis={[
            {
              data: quantityChart.labels,
              scaleType: 'band',
              tickLabelStyle: { fontSize: 11 },
            },
          ]}
          xAxis={[
            {
              tickLabelStyle: { fontSize: 10 },
              valueFormatter: (value) => `${formatCount(value)} ta`,
            },
          ]}
          series={[
            {
              data: quantityChart.values,
              color: theme.palette.primary.main,
              valueFormatter: (value) => `${formatCount(value)} ta`,
            },
          ]}
          height={chartHeight}
          margin={{ top: 8, right: 16, bottom: 24, left: 8 }}
          slotProps={{
            legend: { hidden: true },
          }}
          sx={{
            '& .MuiChartsAxis-left .MuiChartsAxis-tickLabel': {
              fill: theme.palette.text.primary,
            },
          }}
        />
      </Box>
    </Paper>
  )
}
