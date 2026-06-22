import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { getCheckChipProps } from '@/features/settings/utils/deviceCompatibility'

const CheckMetricBox = ({ check }) => {
  const chip = getCheckChipProps(check.status)
  const borderColor =
    check.status === 'pass'
      ? 'success.main'
      : check.status === 'fail'
        ? 'error.main'
        : 'warning.main'

  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 1,
        border: '1px solid',
        borderColor,
        height: '100%',
        bgcolor: (theme) =>
          check.status === 'pass'
            ? theme.palette.mode === 'dark'
              ? 'rgba(46, 125, 50, 0.12)'
              : 'rgba(46, 125, 50, 0.08)'
            : check.status === 'fail'
              ? theme.palette.mode === 'dark'
                ? 'rgba(211, 47, 47, 0.12)'
                : 'rgba(211, 47, 47, 0.08)'
              : theme.palette.mode === 'dark'
                ? 'rgba(237, 108, 2, 0.12)'
                : 'rgba(237, 108, 2, 0.08)',
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Typography variant="caption" color="text.secondary" display="block">
          {check.label}
        </Typography>
        <Chip label={chip.label} color={chip.color} size="small" variant="outlined" />
      </Stack>

      <Typography variant="body2" sx={{ mt: 1 }}>
        <strong>Sizniki:</strong> {check.actualLabel}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <strong>Minimum:</strong> {check.requiredLabel}
      </Typography>
      {check.note ? (
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
          {check.note}
        </Typography>
      ) : null}
    </Box>
  )
}

export const DeviceCompatibilityResults = ({ result, error, showError = true }) => {
  if (showError && error) {
    return <Alert severity="warning">{error}</Alert>
  }

  if (!result) {
    return null
  }

  const overallAlertSeverity =
    result.overallStatus === 'pass'
      ? 'success'
      : result.overallStatus === 'partial'
        ? 'info'
        : 'warning'

  return (
    <Stack spacing={2}>
      <Alert
        severity={overallAlertSeverity}
        sx={{
          borderWidth: 1,
          borderStyle: 'solid',
          ...(result.overallStatus === 'pass'
            ? {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(46, 125, 50, 0.12)'
                    : 'rgba(46, 125, 50, 0.08)',
                borderColor: 'success.light',
              }
            : {}),
        }}
      >
        <Typography variant="subtitle2" fontWeight={700}>
          {result.summary}
        </Typography>
        {result.overallStatus === 'pass' ? (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Ushbu qurilma ZAXIRA dasturida faol ishlashi uchun mos deb topildi.
          </Typography>
        ) : result.overallStatus === 'partial' ? (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Asosiy ko‘rsatkichlar yetarli, lekin ba’zi ma’lumotlar aniqlanmadi.
          </Typography>
        ) : (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Dastur ushbu qurilmada sekin yoki barqaror bo‘lmasligi mumkin.
          </Typography>
        )}
      </Alert>

      {result.checks?.length ? (
        <Grid container spacing={2}>
          {result.checks.map((check) => (
            <Grid key={check.key} size={{ xs: 12, sm: result.checks.length > 1 ? 4 : 12 }}>
              <CheckMetricBox check={check} />
            </Grid>
          ))}
        </Grid>
      ) : null}

      {result.processorEducation?.length ? (
        <Accordion variant="outlined" disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="body2" fontWeight={600}>
              Protsessorlar haqida qisqacha
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={1.5}>
              {result.processorEducation.map((item) => (
                <Box key={item.title}>
                  <Typography variant="body2" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.text}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </AccordionDetails>
        </Accordion>
      ) : null}

      <Typography variant="caption" color="text.secondary">
        Natija brauzer orqali olingan ma’lumotlarga asoslanadi. Aniq model uchun tizim
        sozlamalarini ham tekshiring.
      </Typography>
    </Stack>
  )
}
