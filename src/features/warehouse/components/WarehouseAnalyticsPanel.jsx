import { useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { useTheme } from '@mui/material/styles'
import { useWarehouseAnalyticsData } from '@/features/warehouse/hooks/useWarehouseAnalyticsData'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PERIOD_TABS = [
  { id: 'daily', label: 'Kunlik', hint: 'Oxirgi 7 kun' },
  { id: 'weekly', label: 'Haftalik', hint: 'Oxirgi 8 hafta' },
  { id: 'monthly', label: 'Oylik', hint: 'Oxirgi 6 oy' },
]

const formatDailyLabel = (value) => {
  if (!value) return ''
  const [, month, day] = String(value).split('-')
  return `${day}.${month}`
}

const formatWeeklyLabel = (value) => {
  if (!value) return ''
  const [, month, day] = String(value).split('-')
  return `${day}.${month}`
}

const formatMonthlyLabel = (value) => {
  if (!value) return ''
  const [year, month] = String(value).split('-')
  return `${month}/${String(year).slice(2)}`
}

const formatAxisLabel = (period, value) => {
  if (period === 'monthly') return formatMonthlyLabel(value)
  if (period === 'weekly') return formatWeeklyLabel(value)
  return formatDailyLabel(value)
}

const formatCount = (value) => new Intl.NumberFormat('uz-UZ').format(value ?? 0)

const SummaryCard = ({ label, value, color = 'text.primary', prefix = '' }) => (
  <Paper variant="outlined" sx={{ flex: 1, minWidth: 96, p: 1 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={700} color={color}>
      {prefix}
      {formatCount(value)}
    </Typography>
  </Paper>
)

export const WarehouseAnalyticsPanel = ({ structureId }) => {
  const theme = useTheme()
  const [period, setPeriod] = useState('daily')

  const { data, isLoading, isError, error } = useWarehouseAnalyticsData(structureId)

  const points = data?.[period]?.points ?? []
  const periodHint = PERIOD_TABS.find((tab) => tab.id === period)?.hint ?? ''

  const chartData = useMemo(() => {
    const labels = points.map((p) => formatAxisLabel(period, p.label))
    const received = points.map((p) => p.received ?? 0)
    const outgoing = points.map((p) => (p.expensed ?? 0) + (p.transferred ?? 0))

    return { labels, received, outgoing }
  }, [period, points])

  const summary = useMemo(() => {
    const totalReceived = points.reduce((sum, p) => sum + (p.received ?? 0), 0)
    const totalOutgoing = points.reduce(
      (sum, p) => sum + (p.expensed ?? 0) + (p.transferred ?? 0),
      0,
    )
    const net = totalReceived - totalOutgoing

    return { totalReceived, totalOutgoing, net }
  }, [points])

  if (!structureId) return null

  return (
    <Box>
      <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
        Kirim / chiqim analitikasi
      </Typography>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
        Tanlangan davr bo&apos;yicha kirim (qabul) va chiqim (xarajat + transfer) harakati.
      </Typography>

      <Tabs
        value={period}
        onChange={(_event, value) => {
          if (value) setPeriod(value)
        }}
        variant="fullWidth"
        sx={{ minHeight: 36, mb: 1 }}
      >
        {PERIOD_TABS.map((tab) => (
          <Tab key={tab.id} value={tab.id} label={tab.label} sx={{ minHeight: 36, py: 0.5 }} />
        ))}
      </Tabs>

      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
        {periodHint}
      </Typography>

      {isLoading ? (
        <Stack spacing={1}>
          <Skeleton height={28} />
          <Skeleton variant="rounded" height={160} />
        </Stack>
      ) : isError ? (
        <Alert severity="warning" sx={{ py: 0.5 }}>
          {getApiErrorMessage(error, 'Analitikani yuklab bo‘lmadi')}
        </Alert>
      ) : !points.length ? (
        <Typography variant="body2" color="text.secondary">
          Bu davr uchun kirim/chiqim harakati topilmadi.
        </Typography>
      ) : (
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
            <SummaryCard label="Kirim" value={summary.totalReceived} color="success.main" prefix="+" />
            <SummaryCard label="Chiqim" value={summary.totalOutgoing} color="error.main" prefix="-" />
            <SummaryCard
              label="Saldo"
              value={summary.net}
              color={summary.net >= 0 ? 'success.main' : 'error.main'}
              prefix={summary.net > 0 ? '+' : ''}
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ justifyContent: 'flex-end' }}>
            <Chip size="small" label="Kirim" sx={{ bgcolor: 'success.main', color: 'success.contrastText' }} />
            <Chip size="small" label="Chiqim" sx={{ bgcolor: 'error.main', color: 'error.contrastText' }} />
          </Stack>

          <Box sx={{ width: '100%', minWidth: 0, height: 180 }}>
            <BarChart
              xAxis={[
                {
                  data: chartData.labels,
                  scaleType: 'band',
                  tickLabelStyle: { fontSize: 10 },
                },
              ]}
              series={[
                {
                  data: chartData.received,
                  label: 'Kirim',
                  color: theme.palette.success.main,
                },
                {
                  data: chartData.outgoing,
                  label: 'Chiqim',
                  color: theme.palette.error.main,
                },
              ]}
              height={180}
              margin={{ top: 8, right: 8, bottom: 28, left: 40 }}
              slotProps={{
                legend: { hidden: true },
              }}
              yAxis={[{ width: 40, tickLabelStyle: { fontSize: 10 } }]}
            />
          </Box>
        </Stack>
      )}
    </Box>
  )
}
