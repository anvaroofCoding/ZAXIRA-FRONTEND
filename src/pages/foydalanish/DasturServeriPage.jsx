import { useCallback, useEffect, useMemo, useState } from 'react'
import DnsOutlinedIcon from '@mui/icons-material/DnsOutlined'
import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined'
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Skeleton from '@mui/material/Skeleton'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { PageShell } from '@/shared/components/layout/PageShell'

const STATS_URL =
  'https://zaxira-monitor.tm2.uz/api/system/stats?key=zaxira-monitor-8f3k9x2m7q1w'
const POLL_INTERVAL_MS = 5000
const HISTORY_LIMIT = 24

const formatPercent = (value) => `${Math.round(Number(value) || 0)}%`
const formatGib = (value) => `${Number(value || 0).toFixed(2)} GB`
const formatMib = (value) => `${Math.round(Number(value) || 0)} MB`

const formatUptime = (uptimeSeconds) => {
  const total = Math.max(0, Math.floor(Number(uptimeSeconds) || 0))
  const days = Math.floor(total / 86400)
  const hours = Math.floor((total % 86400) / 3600)
  const minutes = Math.floor((total % 3600) / 60)

  if (days > 0) return `${days} kun ${hours} soat ${minutes} daqiqa`
  return `${hours} soat ${minutes} daqiqa`
}

const loadLabel = (value) => (Number(value || 0) > 1 ? 'Band' : 'Normal')

const pushHistory = (prev, next) => {
  const merged = [...prev, next]
  if (merged.length > HISTORY_LIMIT) {
    return merged.slice(merged.length - HISTORY_LIMIT)
  }
  return merged
}

const TrendBars = ({ values = [], color = 'primary.main' }) => (
  <Stack direction="row" spacing={0.35} sx={{ alignItems: 'flex-end', height: 40, mt: 1 }}>
    {values.map((value, index) => (
      <Box
        key={`${index}-${value}`}
        sx={{
          width: 6,
          borderRadius: 0.5,
          minHeight: 4,
          height: `${Math.max(4, Math.min(100, Number(value) || 0))}%`,
          bgcolor: color,
          opacity: 0.3 + (index + 1) / (values.length * 1.45),
          transition: 'height 250ms ease',
        }}
      />
    ))}
  </Stack>
)

const DasturServeriPageSkeleton = () => (
  <PageShell>
    <Stack spacing={2.5}>
      <Skeleton variant="text" width="36%" height={42} />

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.25}>
          <Skeleton variant="rounded" height={140} />
          <Skeleton variant="text" width="82%" />
          <Skeleton variant="text" width="68%" />
        </Stack>
      </Paper>
    </Stack>
  </PageShell>
)

const StatCard = ({ icon, label, valueText, percent, helperText, trend, color }) => (
  <Card variant="outlined" sx={{ flex: 1, minWidth: 240 }}>
    <CardContent>
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
        {icon}
        <Typography variant="subtitle2" color="text.secondary">
          {label}
        </Typography>
      </Stack>
      <Typography variant="h5" fontWeight={700}>
        {valueText}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
        {helperText}
      </Typography>
      <LinearProgress
        variant="determinate"
        value={Math.max(0, Math.min(100, Number(percent) || 0))}
        sx={{ mt: 1.5, height: 8, borderRadius: 999, bgcolor: 'action.hover' }}
        color={color}
      />
      <TrendBars values={trend} color={color === 'error' ? 'error.main' : 'primary.main'} />
    </CardContent>
  </Card>
)

export const DasturServeriPage = () => {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdatedAt, setLastUpdatedAt] = useState('')
  const [history, setHistory] = useState({ cpu: [], memory: [], disk: [] })

  const fetchStats = useCallback(async (signal) => {
    try {
      const response = await fetch(STATS_URL, { signal })
      if (!response.ok) {
        throw new Error(`Server javobi xato: ${response.status}`)
      }

      const payload = await response.json()
      const data = payload?.data
      if (!payload?.success || !data) {
        throw new Error('Statistika formati noto‘g‘ri')
      }

      setStats(data)
      setLastUpdatedAt(new Date().toLocaleTimeString('uz-UZ'))
      setHistory((prev) => ({
        cpu: pushHistory(prev.cpu, Number(data?.cpu?.usagePercent || 0)),
        memory: pushHistory(prev.memory, Number(data?.memory?.usagePercent || 0)),
        disk: pushHistory(prev.disk, Number(data?.disk?.usagePercent || 0)),
      }))
      setError('')
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Server statistikani olib bo‘lmadi')
      }
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    fetchStats(controller.signal)
    const timer = setInterval(() => fetchStats(controller.signal), POLL_INTERVAL_MS)

    return () => {
      controller.abort()
      clearInterval(timer)
    }
  }, [fetchStats])

  const loadInfo = useMemo(() => {
    const load = stats?.loadAverage ?? []
    if (load.length === 0) return '—'
    return load.map((value) => Number(value).toFixed(2)).join(' | ')
  }, [stats?.loadAverage])

  if (isLoading && !stats) {
    return <DasturServeriPageSkeleton />
  }

  return (
    <PageShell>
      <Stack spacing={2.5}>
        <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ justifyContent: 'space-between' }}>
          <Box>
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <DnsOutlinedIcon color="primary" />
              <Typography variant="h5" fontWeight={700}>
                Dastur serveri
              </Typography>
            </Stack>
          </Box>
          <Chip
            label={isLoading ? 'Yuklanmoqda...' : `Oxirgi yangilanish: ${lastUpdatedAt || '—'}`}
            color="primary"
            variant="outlined"
            sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}
          />
        </Stack>

        {error ? <Alert severity="error">{error}</Alert> : null}

        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1.5}>
          <StatCard
            icon={<MemoryOutlinedIcon color="primary" fontSize="small" />}
            label="CPU"
            valueText={formatPercent(stats?.cpu?.usagePercent)}
            percent={stats?.cpu?.usagePercent}
            helperText={`${stats?.cpu?.cores ?? 0} yadro • ${stats?.cpu?.model ?? 'Noma’lum'}`}
            trend={history.cpu}
            color={Number(stats?.cpu?.usagePercent || 0) > 80 ? 'error' : 'primary'}
          />
          <StatCard
            icon={<StorageOutlinedIcon color="primary" fontSize="small" />}
            label="Operativ xotira"
            valueText={formatPercent(stats?.memory?.usagePercent)}
            percent={stats?.memory?.usagePercent}
            helperText={`${formatMib(stats?.memory?.usedMB)} / ${formatMib(stats?.memory?.totalMB)}`}
            trend={history.memory}
            color={Number(stats?.memory?.usagePercent || 0) > 85 ? 'error' : 'primary'}
          />
          <StatCard
            icon={<StorageOutlinedIcon color="primary" fontSize="small" />}
            label="Disk"
            valueText={formatPercent(stats?.disk?.usagePercent)}
            percent={stats?.disk?.usagePercent}
            helperText={`${formatGib(stats?.disk?.usedGB)} / ${formatGib(stats?.disk?.totalGB)}`}
            trend={history.disk}
            color={Number(stats?.disk?.usagePercent || 0) > 85 ? 'error' : 'primary'}
          />
        </Stack>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700}>
              Tizim tafsilotlari
            </Typography>
            <Divider sx={{ my: 1.5 }} />
            <Stack spacing={0.7}>
              <Typography variant="body2">
                Uptime: <strong>{formatUptime(stats?.uptimeSeconds)}</strong>
              </Typography>
              <Typography variant="body2">
                Load average: <strong>{loadInfo}</strong> ({loadLabel(stats?.loadAverage?.[0])})
              </Typography>
              <Typography variant="body2">
                Disk bo‘limi: <strong>{stats?.disk?.filesystem ?? '—'}</strong> ({stats?.disk?.mountPoint ?? '—'}
                )
              </Typography>
              <Typography variant="body2">
                Bo‘sh joy: <strong>{formatGib(stats?.disk?.availGB)}</strong>
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </PageShell>
  )
}
