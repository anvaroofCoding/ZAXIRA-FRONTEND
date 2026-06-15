import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useInternetSpeedTest } from '@/features/settings/hooks/useInternetSpeedTest'
import {
  getDownloadLabel,
  getLatencyLabel,
} from '@/features/settings/utils/internetSpeedTest'

const MetricBox = ({ title, value, unit, quality }) => (
  <Box
    sx={{
      p: 2,
      borderRadius: 2,
      border: '1px solid',
      borderColor: 'divider',
      bgcolor: 'background.default',
      height: '100%',
    }}
  >
    <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
      {title}
    </Typography>
    <Stack direction="row" alignItems="baseline" spacing={0.75} sx={{ mb: 1 }}>
      <Typography variant="h4" component="span" fontWeight={700}>
        {value}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {unit}
      </Typography>
    </Stack>
    {quality ? (
      <Chip label={quality.label} color={quality.color} size="small" variant="outlined" />
    ) : null}
  </Box>
)

export const InternetSpeedCard = () => {
  const { status, result, error, isMeasuring, runTest } = useInternetSpeedTest()

  const latencyQuality = result ? getLatencyLabel(result.latencyMs) : null
  const downloadQuality = result ? getDownloadLabel(result.downloadMbps) : null

  return (
    <Card variant="outlined">
      <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'center' },
            justifyContent: 'space-between',
            gap: 1.5,
            mb: 1,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0, flex: 1 }}>
            <SpeedOutlinedIcon color="primary" sx={{ flexShrink: 0 }} />
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={600}>
                Internet tezligi
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sahifaga kirganingizda server bilan aloqa avtomatik tekshiriladi
              </Typography>
            </Box>
          </Stack>
          <Button
            variant="outlined"
            size="small"
            onClick={runTest}
            disabled={isMeasuring}
            startIcon={
              isMeasuring ? <CircularProgress size={14} color="inherit" /> : <RefreshOutlinedIcon />
            }
            sx={{
              flexShrink: 0,
              ml: 'auto',
              alignSelf: { xs: 'flex-end', sm: 'center' },
              whiteSpace: 'nowrap',
              py: 0.5,
              px: 1.25,
              fontSize: '0.8125rem',
              textTransform: 'none',
            }}
          >
            Internetni tekshirish
          </Button>
        </Box>

        <Divider sx={{ my: 1.5 }} />

        {isMeasuring ? (
          <Stack spacing={1.5}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary">
              Kechikish va yuklab olish tezligi o‘lchanmoqda...
            </Typography>
          </Stack>
        ) : null}

        {status === 'error' ? (
          <Alert severity="warning" sx={{ mt: isMeasuring ? 1.5 : 0 }}>
            {error || 'Internet tezligini aniqlab bo‘lmadi'}
          </Alert>
        ) : null}

        {result ? (
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MetricBox
                title="Kechikish (ping)"
                value={result.latencyMs}
                unit="ms"
                quality={latencyQuality}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <MetricBox
                title="Yuklab olish tezligi"
                value={result.downloadMbps}
                unit="Mbit/s"
                quality={downloadQuality}
              />
            </Grid>
          </Grid>
        ) : null}

        {result ? (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 2 }}>
            Natija server bilan aloqa tezligini ko‘rsatadi. Past qiymat — internet yoki tarmoq sekin
            bo‘lishi mumkin.
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  )
}
