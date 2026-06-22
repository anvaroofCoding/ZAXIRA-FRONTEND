import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatDateTime } from '@/shared/utils/formatDate'
import { formatProcessorLabel } from '@/shared/utils/detectProcessorInfo'

const formatValue = (value, suffix = '') => {
  if (value === null || value === undefined || value === '') return '—'
  return `${value}${suffix}`
}

const MetricRow = ({ label, value, hint }) => (
  <Box>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    <Typography variant="body2" fontWeight={600}>
      {value}
    </Typography>
    {hint ? (
      <Typography variant="caption" color="text.secondary" display="block">
        {hint}
      </Typography>
    ) : null}
  </Box>
)

const PercentBar = ({ label, percent, detail }) => {
  const safePercent = typeof percent === 'number' ? Math.min(100, Math.max(0, percent)) : null

  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5 }}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        fontWeight={700}
        sx={{ mb: 1, fontVariantNumeric: 'tabular-nums' }}
      >
        {safePercent !== null ? `${safePercent}%` : '—'}
      </Typography>
      {safePercent !== null ? (
        <LinearProgress
          variant="determinate"
          value={safePercent}
          sx={{ height: 8, borderRadius: 1 }}
        />
      ) : (
        <LinearProgress variant="indeterminate" sx={{ height: 8, borderRadius: 1, opacity: 0.2 }} />
      )}
      {detail ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.75 }}>
          {detail}
        </Typography>
      ) : null}
    </Box>
  )
}

export const UserDeviceTelemetryPanel = ({ device, loading, layout = 'compact' }) => {
  const isPageLayout = layout === 'page'
  const gridColumns = isPageLayout
    ? { xs: '1fr', sm: 'repeat(2, 1fr)' }
    : { xs: '1fr', sm: 'repeat(2, 1fr)' }

  if (loading) {
    return (
      <Paper variant="outlined" sx={{ p: isPageLayout ? 2.5 : 2, height: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          Qurilma ma’lumotlari yuklanmoqda...
        </Typography>
      </Paper>
    )
  }

  if (!device) {
    return (
      <Paper variant="outlined" sx={{ p: isPageLayout ? 2.5 : 2, height: '100%' }}>
        <Typography variant="body2" color="text.secondary">
          Oxirgi qurilma ma’lumotlari hali yo‘q
        </Typography>
      </Paper>
    )
  }

  const telemetry = device.telemetry ?? {}
  const networkSpeed =
    telemetry.networkDownlinkMbps != null
      ? `${telemetry.networkDownlinkMbps} Mbit/s`
      : '—'
  const processorLabel = formatProcessorLabel({
    processorModel: telemetry.processorModel,
    processorArchitecture: telemetry.processorArchitecture,
    processorPlatform: telemetry.processorPlatform,
    cpuCores: telemetry.cpuCores,
    processor: telemetry.processor,
  })
  const processorHint =
    telemetry.processorModel && telemetry.processorPlatform
      ? `Platforma: ${telemetry.processorPlatform}`
      : telemetry.processorPlatform && !telemetry.processor?.includes(telemetry.processorPlatform)
        ? `Platforma: ${telemetry.processorPlatform}`
        : null

  return (
    <Paper variant="outlined" sx={{ p: isPageLayout ? 2.5 : 2, mb: isPageLayout ? 0 : 2, height: '100%' }}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Typography variant={isPageLayout ? 'subtitle1' : 'subtitle2'} fontWeight={700}>
            Oxirgi foydalanilgan qurilma
          </Typography>
          {device.isOnline ? (
            <Chip size="small" color="success" label="Hozir onlayn" />
          ) : (
            <Chip size="small" variant="outlined" label="Oflayn" />
          )}
        </Stack>

        <Typography variant="body2">
          <strong>Qurilma:</strong> {device.deviceName || '—'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Oxirgi faollik: {formatDateTime(device.lastActiveAt)}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Ma’lumot yangilangan: {formatDateTime(device.telemetryUpdatedAt || telemetry.collectedAt)}
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: 2,
          }}
        >
          <MetricRow
            label="RAM (taxminiy)"
            value={telemetry.ramGb != null ? `${telemetry.ramGb} GB` : '—'}
            hint="Brauzer xavfsizlik cheklovi"
          />
          <MetricRow
            label="Protsessor"
            value={processorLabel}
            hint={processorHint}
          />
          <MetricRow
            label="Tarmoq turi"
            value={formatValue(telemetry.networkType)}
          />
          <MetricRow
            label="Internet tezligi (taxminiy)"
            value={networkSpeed}
            hint={
              telemetry.networkRttMs != null
                ? `Kechikish: ${telemetry.networkRttMs} ms`
                : null
            }
          />
          <MetricRow
            label="Ekran"
            value={
              telemetry.screenWidth && telemetry.screenHeight
                ? `${telemetry.screenWidth}×${telemetry.screenHeight}`
                : '—'
            }
          />
        </Box>

        <PercentBar
          label="Brauzer xotirasi bandligi"
          percent={telemetry.memoryUsedPercent}
          detail={
            telemetry.jsHeapUsedMb != null && telemetry.jsHeapLimitMb != null
              ? `${telemetry.jsHeapUsedMb} MB / ${telemetry.jsHeapLimitMb} MB`
              : 'Faqat Chrome/Edge brauzerlarida'
          }
        />

        <PercentBar
          label="Saqlash xotirasi (disk) bandligi"
          percent={telemetry.storageUsedPercent}
          detail={
            telemetry.storageUsedMb != null && telemetry.storageQuotaMb != null
              ? `${telemetry.storageUsedMb} MB / ${telemetry.storageQuotaMb} MB`
              : 'Sayt uchun ajratilgan joy'
          }
        />

        {device.userAgent ? (
          <Typography variant="caption" color="text.secondary" display="block">
            {device.userAgent}
          </Typography>
        ) : null}
      </Stack>
    </Paper>
  )
}
