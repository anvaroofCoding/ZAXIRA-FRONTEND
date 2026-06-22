import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Paper from '@mui/material/Paper'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Typography from '@mui/material/Typography'
import { BarChart } from '@mui/x-charts/BarChart'
import { PieChart } from '@mui/x-charts/PieChart'
import { useTheme } from '@mui/material/styles'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const PERIOD_TABS = [
  { id: 'yearly', label: 'Yillik' },
  { id: 'monthly', label: 'Oylik' },
]

const CATEGORY_COLORS = {
  purchased: 'success.main',
  waiting: 'warning.main',
  unavailable: 'error.main',
}

const formatCount = (value) => new Intl.NumberFormat('uz-UZ').format(value ?? 0)

const SummaryCard = ({ label, value, suffix = '', color = 'text.primary' }) => (
  <Paper variant="outlined" sx={{ flex: 1, minWidth: 120, p: 1.5 }}>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="h6" fontWeight={700} color={color}>
      {formatCount(value)}
      {suffix}
    </Typography>
  </Paper>
)

export const PurchaseStatisticsPanel = ({
  structure,
  summary,
  points = [],
  granularity,
  year,
  onGranularityChange,
  onYearChange,
  isLoading,
  isError,
  error,
}) => {
  const theme = useTheme()

  const pieData = [
    {
      id: 'purchased',
      value: summary?.purchasedQuantity ?? 0,
      label: 'Sotib olingan',
      color: theme.palette.success.main,
    },
    {
      id: 'waiting',
      value: summary?.waitingQuantity ?? 0,
      label: 'Kutilmoqda',
      color: theme.palette.warning.main,
    },
    {
      id: 'unavailable',
      value: summary?.unavailableQuantity ?? 0,
      label: 'Mavjud emas',
      color: theme.palette.error.main,
    },
  ].filter((item) => item.value > 0)

  const chartLabels = points.map((point) => point.label)
  const purchasedSeries = points.map((point) => point.purchasedQuantity ?? 0)
  const waitingSeries = points.map((point) => point.waitingQuantity ?? 0)
  const unavailableSeries = points.map((point) => point.unavailableQuantity ?? 0)

  const yearOptions = Array.from({ length: 6 }).map((_, index) => {
    const value = new Date().getFullYear() - index
    return value
  })

  if (!structure) {
    return (
      <Paper variant="outlined" sx={{ p: 3, flex: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Analitikani ko‘rish uchun chap tomondan tuzilmani tanlang.
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, flex: 1, minWidth: 0 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="overline" color="text.secondary" display="block">
            Tuzilma bo‘yicha analitika
          </Typography>
          <Typography variant="h6" fontWeight={700}>
            {structure.shortName}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {structure.fullName}
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
            Tasdiqlangan arizalardagi tovarlar miqdori bo‘yicha (charter navbatida kutilayotganlar
            ham hisobga olinadi)
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
          <Tabs
            value={granularity}
            onChange={(_event, value) => {
              if (value) onGranularityChange(value)
            }}
            sx={{ minHeight: 36 }}
          >
            {PERIOD_TABS.map((tab) => (
              <Tab key={tab.id} value={tab.id} label={tab.label} sx={{ minHeight: 36, py: 0.5 }} />
            ))}
          </Tabs>

          {granularity === 'monthly' ? (
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel id="purchase-stats-year-label">Yil</InputLabel>
              <Select
                labelId="purchase-stats-year-label"
                label="Yil"
                value={year}
                onChange={(event) => onYearChange(Number(event.target.value))}
              >
                {yearOptions.map((optionYear) => (
                  <MenuItem key={optionYear} value={optionYear}>
                    {optionYear}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          ) : null}
        </Stack>

        {isLoading ? (
          <Stack spacing={1.5}>
            <Skeleton variant="rounded" height={88} />
            <Skeleton variant="rounded" height={220} />
            <Skeleton variant="rounded" height={240} />
          </Stack>
        ) : isError ? (
          <Alert severity="warning">
            {getApiErrorMessage(error, 'Statistikani yuklab bo‘lmadi')}
          </Alert>
        ) : (
          <>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <SummaryCard
                label="Sotib olingan"
                value={summary?.purchasedPercent ?? 0}
                suffix="%"
                color={CATEGORY_COLORS.purchased}
              />
              <SummaryCard
                label="Kutilmoqda"
                value={summary?.waitingPercent ?? 0}
                suffix="%"
                color={CATEGORY_COLORS.waiting}
              />
              <SummaryCard
                label="Mavjud emas"
                value={summary?.unavailablePercent ?? 0}
                suffix="%"
                color={CATEGORY_COLORS.unavailable}
              />
              <SummaryCard
                label="Jami miqdor"
                value={summary?.totalQuantity ?? 0}
              />
              <SummaryCard
                label="Tasdiqlangan arizalar"
                value={summary?.approvedRequestCount ?? 0}
              />
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              <Chip
                size="small"
                label="Sotib olingan"
                sx={{ bgcolor: 'success.main', color: 'success.contrastText' }}
              />
              <Chip
                size="small"
                label="Kutilmoqda"
                sx={{ bgcolor: 'warning.main', color: 'warning.contrastText' }}
              />
              <Chip
                size="small"
                label="Mavjud emas"
                sx={{ bgcolor: 'error.main', color: 'error.contrastText' }}
              />
            </Stack>

            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={2}
              sx={{ alignItems: 'stretch' }}
            >
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  Umumiy taqsimot
                </Typography>
                {pieData.length ? (
                  <PieChart
                    series={[
                      {
                        data: pieData,
                        innerRadius: 42,
                        paddingAngle: 2,
                        cornerRadius: 4,
                        valueFormatter: (item) => `${formatCount(item.value)} ta`,
                      },
                    ]}
                    height={240}
                    margin={{ top: 8, right: 8, bottom: 8, left: 8 }}
                    slotProps={{
                      legend: {
                        direction: 'row',
                        position: { vertical: 'bottom', horizontal: 'middle' },
                      },
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Bu tuzilma uchun tasdiqlangan arizalar topilmadi.
                  </Typography>
                )}
              </Box>

              <Box sx={{ flex: 1.4, minWidth: 0 }}>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  {granularity === 'monthly' ? `${year}-yil bo‘yicha oylik` : 'Yillik dinamika'}
                </Typography>
                {points.some((point) => point.totalQuantity > 0) ? (
                  <BarChart
                    xAxis={[
                      {
                        data: chartLabels,
                        scaleType: 'band',
                        tickLabelStyle: { fontSize: 10 },
                      },
                    ]}
                    series={[
                      {
                        data: purchasedSeries,
                        label: 'Sotib olingan',
                        color: theme.palette.success.main,
                        stack: 'total',
                      },
                      {
                        data: waitingSeries,
                        label: 'Kutilmoqda',
                        color: theme.palette.warning.main,
                        stack: 'total',
                      },
                      {
                        data: unavailableSeries,
                        label: 'Mavjud emas',
                        color: theme.palette.error.main,
                        stack: 'total',
                      },
                    ]}
                    height={240}
                    margin={{ top: 8, right: 8, bottom: 28, left: 40 }}
                    yAxis={[{ width: 40, tickLabelStyle: { fontSize: 10 } }]}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    Tanlangan davr uchun ma’lumot yo‘q.
                  </Typography>
                )}
              </Box>
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  )
}
