import { useEffect, useMemo, useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Alert from '@mui/material/Alert'
import FormControl from '@mui/material/FormControl'
import Grid from '@mui/material/Grid'
import IconButton from '@mui/material/IconButton'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'
import Button from '@mui/material/Button'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { LineChart } from '@mui/x-charts/LineChart'
import { SparkLineChart } from '@mui/x-charts/SparkLineChart'
import dayjs from 'dayjs'
import { useNavigate } from 'react-router-dom'
import { useGetStructuresQuery } from '@/features/structures/api/structuresApi'
import { useGetDashboardDailyMaxQuery, useGetDashboardSummaryQuery } from '@/features/dashboard/api/dashboardApi'
import { usePermissions } from '@/shared/hooks/usePermissions'
import { formatUzs } from '@/shared/utils/formatUzs'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

const SummaryCard = ({ label, value, rawValue, series, chartColor }) => {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (!Number.isFinite(rawValue)) {
      setDisplayValue(0)
      return
    }

    const durationMs = 900
    const start = performance.now()
    const from = displayValue
    const to = rawValue
    let rafId = 0

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / durationMs)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = Math.round(from + (to - from) * eased)
      setDisplayValue(next)

      if (progress < 1) {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
    // displayValue ni dependencyga qo'shmaymiz, aks holda animatsiya loopga tushadi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rawValue])

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardContent sx={{ py: 2.25 }}>
        <Stack
          direction="row"
          gap={1.5}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0, flex: 1, pr: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5" fontWeight={700} sx={{ mt: 0.25, whiteSpace: 'nowrap' }}>
              {Number.isFinite(rawValue) ? formatUzs(displayValue) : value}
            </Typography>
          </Box>

          {Array.isArray(series) && series.length ? (
            <Box sx={{ width: 120, height: 44, mt: 0.25, ml: 2, flexShrink: 0 }}>
              <SparkLineChart
                key={chartColor}
                data={series}
                height={44}
                showTooltip={false}
                showHighlight={false}
                curve="linear"
                color={chartColor}
                area
              />
            </Box>
          ) : null}
        </Stack>
      </CardContent>
    </Card>
  )
}

const ChartCard = ({ title, subtitle, children, sx }) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      overflow: 'hidden',
      ...sx,
    }}
  >
    <CardContent sx={{ py: 2 }}>
      {title || subtitle ? (
        <Stack
          direction="row"
          gap={2}
          sx={{ mb: 1, alignItems: 'baseline', justifyContent: 'space-between' }}
        >
          <Box sx={{ minWidth: 0 }}>
            {title ? (
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {title}
              </Typography>
            ) : null}
            {subtitle ? (
              <Typography variant="caption" color="text.secondary" noWrap>
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      ) : null}
      {children}
    </CardContent>
  </Card>
)

const SummaryCardSkeleton = () => (
  <Card variant="outlined" sx={{ height: '100%' }}>
    <CardContent sx={{ py: 2.25 }}>
      <Stack
        direction="row"
        gap={1.5}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Skeleton variant="text" width="42%" height={24} />
          <Skeleton variant="text" width="55%" height={42} />
        </Box>
        <Skeleton variant="rounded" width={120} height={44} />
      </Stack>
    </CardContent>
  </Card>
)

const ChartSkeleton = () => (
  <Card variant="outlined">
    <CardContent sx={{ py: 2 }}>
      <Skeleton variant="text" width={220} height={24} sx={{ mb: 1 }} />
      <Skeleton variant="rounded" width="100%" height={440} />
    </CardContent>
  </Card>
)

const DAILY_WINDOW_DAYS = 30
const UZ_MONTHS = [
  'yanvar',
  'fevral',
  'mart',
  'aprel',
  'may',
  'iyun',
  'iyul',
  'avgust',
  'sentyabr',
  'oktyabr',
  'noyabr',
  'dekabr',
]

const formatTooltipDateUz = (value) => {
  const date = dayjs(value)
  if (!date.isValid()) return String(value ?? '')
  const day = date.date()
  const month = UZ_MONTHS[date.month()] ?? ''
  const year = date.year()
  return `${day}-${month} ${year}-yil`
}

const formatDateRangeToken = (value) => {
  const date = dayjs(value)
  if (!date.isValid()) return String(value ?? '')
  return date.format('DD.MM.YYYY')
}

export const DashboardPage = () => {
  const theme = useTheme()
  const chartColor = theme.palette.primary.main
  const { user, canAccess, canCreate } = usePermissions()
  const navigate = useNavigate()
  const isSuperAdmin = user?.isSuperAdmin || user?.role === 'SUPER_ADMIN'
  const viewerStructureId = user?.structureId ?? ''
  const hasExpensePermission = canCreate('/omborlar/chiqim-qilish')
  const canAccessExpense = canAccess('/omborlar/chiqim-qilish')
  const hasDashboardAccess = canAccess('/dashboard')
  const canViewProducts = canAccess('/dashboard/maxsulotlar')
  const canExpense = Boolean(isSuperAdmin || hasExpensePermission || canAccessExpense)

  const { data: structures = [] } = useGetStructuresQuery()
  const activeStructures = useMemo(() => structures.filter((s) => s.isActive), [structures])
  const structureOptions = useMemo(
    () => activeStructures,
    [activeStructures],
  )

  const defaultStructureId = isSuperAdmin ? 'all' : (viewerStructureId || 'all')
  const [structureId, setStructureId] = useState(defaultStructureId)
  const [offsetDays, setOffsetDays] = useState(0)

  useEffect(() => {
    if (!structureId) {
      setStructureId(viewerStructureId || structureOptions[0]?.id || 'all')
      return
    }
    if (structureId === 'all') return
    const exists = structureOptions.some((s) => s.id === structureId)
    if (!exists) {
      setStructureId(structureOptions[0]?.id || viewerStructureId || 'all')
    }
  }, [isSuperAdmin, structureId, structureOptions, viewerStructureId])

  const scopeParam = structureId || 'all'
  const canQuery = Boolean(hasDashboardAccess)

  const summaryQuery = useGetDashboardSummaryQuery(
    { structureId: scopeParam },
    { skip: !canQuery, refetchOnMountOrArgChange: true },
  )
  const dailyQuery = useGetDashboardDailyMaxQuery(
    { structureId: scopeParam, days: DAILY_WINDOW_DAYS, offsetDays },
    { skip: !canQuery, refetchOnMountOrArgChange: true },
  )

  const summary = summaryQuery.data
  const points = dailyQuery.data?.points ?? []
  const isSummaryBootLoading = summaryQuery.isLoading && !summaryQuery.data
  const isChartBootLoading = dailyQuery.isLoading && !dailyQuery.data

  const normalizedDailyPoints = useMemo(() => {
    const from = dailyQuery.data?.from
      ? dayjs(dailyQuery.data.from)
      : dayjs().add(offsetDays - (DAILY_WINDOW_DAYS - 1), 'day')
    const daysRange = Array.from({ length: DAILY_WINDOW_DAYS }).map((_, idx) =>
      from.add(idx, 'day').format('YYYY-MM-DD'),
    )

    const byDay = new Map(points.map((p) => [p.day, p]))
    let running = 0

    return daysRange.map((day) => {
      const found = byDay.get(day)
      const received = found?.received ?? 0
      // API maxQuantity yo'q kunlarda ham grafigimiz uzilmasligi uchun cumulative yuritamiz
      running = found?.maxQuantity ?? (running + received)
      return {
        day,
        maxQuantity: running,
      }
    })
  }, [dailyQuery.data?.from, offsetDays, points])

  const days = useMemo(
    () => normalizedDailyPoints.map((p) => p.day),
    [normalizedDailyPoints],
  )
  const maxSeries = useMemo(
    () => normalizedDailyPoints.map((p) => p.maxQuantity ?? 0),
    [normalizedDailyPoints],
  )
  const sparkSeries = useMemo(() => maxSeries.slice(-18), [maxSeries])

  return (
    <Box sx={{ mx: { xs: -1.5, sm: -2 } }}>
      <Stack direction="row" gap={2} sx={{ mb: 2, alignItems: 'center' }}>
        <Typography variant="h5" component="h1" fontWeight={700}>
          Dashboard
        </Typography>

        <Stack direction="row" spacing={1.25} sx={{ ml: 'auto', alignItems: 'center' }}>
          {hasDashboardAccess ? (
            <Button
              variant="outlined"
              startIcon={<CalendarMonthIcon />}
              onClick={() => navigate('/dashboard/kalendar')}
            >
              Kalendar
            </Button>
          ) : null}

          {canViewProducts ? (
            <Button
              variant="outlined"
              onClick={() => navigate('/dashboard/maxsulotlar')}
            >
              Maxsulotlar
            </Button>
          ) : null}

          {canExpense ? (
            <Button
              variant="contained"
              onClick={() => navigate('/omborlar/chiqim-qilish')}
            >
              Chiqim
            </Button>
          ) : null}

          <FormControl
            size="small"
            sx={{
              minWidth: 260,
              position: 'sticky',
              top: 12,
              right: 12,
              alignSelf: 'flex-start',
              zIndex: 2,
            }}
          >
            <InputLabel id="dashboard-structure-label">Analitika</InputLabel>
            <Select
              labelId="dashboard-structure-label"
              label="Analitika"
              value={structureId}
              onChange={(e) => {
                if (hasDashboardAccess) {
                  setStructureId(e.target.value)
                }
              }}
              disabled={!hasDashboardAccess}
            >
              <MenuItem value="all">Barchasi</MenuItem>
              {structureOptions.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                {s.shortName}
                </MenuItem>
              ))}
              {!isSuperAdmin && !structureOptions.length ? (
                <MenuItem value={viewerStructureId || ''}>
                  {user?.structure?.shortName || user?.structure?.fullName || 'Tuzilma biriktirilmagan'}
                </MenuItem>
              ) : null}
            </Select>
          </FormControl>
        </Stack>
      </Stack>

      {!canQuery ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Sizga tuzilma biriktirilmagan. Dashboard ma’lumotlarini ko‘rish uchun admin tuzilma
          biriktirishi kerak.
        </Alert>
      ) : null}

      {summaryQuery.isError || dailyQuery.isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {getApiErrorMessage(summaryQuery.error || dailyQuery.error, 'Dashboard yuklanmadi')}
        </Alert>
      ) : null}

      {/* Summary row */}
 <Grid container spacing={2} sx={{ mb: 2, width: '100%', alignItems: 'stretch' }}>
        <Grid size={4}>
          {isSummaryBootLoading ? (
            <SummaryCardSkeleton />
          ) : (
            <SummaryCard
              label="Tovar turi"
              value={summary ? formatUzs(summary.itemTypesCount) : '—'}
              rawValue={summary?.itemTypesCount}
              series={sparkSeries}
              chartColor={chartColor}
            />
          )}
        </Grid>
        <Grid size={4}>
          {isSummaryBootLoading ? (
            <SummaryCardSkeleton />
          ) : (
            <SummaryCard
              label="Jami miqdor"
              value={summary ? formatUzs(summary.totalQuantity) : '—'}
              rawValue={summary?.totalQuantity}
              series={sparkSeries}
              chartColor={chartColor}
            />
          )}
        </Grid>
        <Grid size={4}>
          {isSummaryBootLoading ? (
            <SummaryCardSkeleton />
          ) : (
            <SummaryCard
              label="Jami joriy summa"
              value={summary ? formatUzs(summary.totalSum) : '—'}
              rawValue={summary?.totalSum}
              series={sparkSeries}
              chartColor={chartColor}
            />
          )}
        </Grid>
      </Grid>

      {/* Analytics row */}
      <Box sx={{ width: '100%' }}>
        <Stack
          direction="row"
          spacing={0.5}
          sx={{
            mb: 1,
            minHeight: 40,
            justifyContent: 'flex-start',
            alignItems: 'center',
          }}
        >
          <Tooltip title="Oldingi kunlar">
            <span>
              <IconButton
                size="small"
                onClick={() => setOffsetDays((prev) => prev - DAILY_WINDOW_DAYS)}
                disabled={dailyQuery.isFetching}
              >
                <ChevronLeftIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              minWidth: 210,
              textAlign: 'center',
              fontWeight: 400,
              height: 40,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {formatDateRangeToken(days[0])}-{formatDateRangeToken(days[days.length - 1])}
          </Typography>
          <Tooltip title="Keyingi kunlar">
            <span>
              <IconButton
                size="small"
                onClick={() => setOffsetDays((prev) => prev + DAILY_WINDOW_DAYS)}
                disabled={dailyQuery.isFetching}
              >
                <ChevronRightIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
        {isChartBootLoading ? (
          <ChartSkeleton />
        ) : (
          <ChartCard sx={{ width: '100%' }}>
            <Box sx={{ height: 440, width: '100%', minWidth: 0 }}>
              <LineChart
                xAxis={[
                  {
                    data: days,
                    scaleType: 'point',
                    valueFormatter: (value, context) =>
                      context.location === 'tooltip'
                        ? formatTooltipDateUz(value)
                        : String(value ?? ''),
                  },
                ]}
                series={[
                  {
                    data: maxSeries,
                    label: 'Maksimum qoldiq',
                    valueFormatter: (v) => formatUzs(v),
                    area: true,
                    showMark: false,
                    color: chartColor,
                  },
                ]}
                height={440}
                margin={{ top: 20, left: 72, right: 20, bottom: 30 }}
                slotProps={{
                  legend: { hidden: true },
                }}
                yAxis={[
                  {
                    valueFormatter: (v) => formatUzs(v),
                  },
                ]}
              />
            </Box>
          </ChartCard>
        )}
      </Box>

    </Box>
  )
}
