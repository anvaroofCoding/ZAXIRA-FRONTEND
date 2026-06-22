import DevicesOtherOutlinedIcon from '@mui/icons-material/DevicesOtherOutlined'
import RefreshOutlinedIcon from '@mui/icons-material/RefreshOutlined'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useEffect } from 'react'
import { DeviceCompatibilityResults } from '@/features/settings/components/DeviceCompatibilityResults'
import { useDeviceCompatibilityCheck } from '@/features/settings/hooks/useDeviceCompatibilityCheck'
import { MIN_REQUIREMENTS } from '@/features/settings/utils/deviceCompatibility'

export const DeviceCompatibilityModal = ({ open, onClose }) => {
  const { status, result, error, isChecking, runCheck, reset } = useDeviceCompatibilityCheck()

  useEffect(() => {
    if (!open) {
      reset()
    }
  }, [open, reset])

  const handleClose = () => {
    if (isChecking) return
    onClose()
  }

  const hasResult = Boolean(result) || status === 'error'

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle sx={{ fontWeight: 600 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <DevicesOtherOutlinedIcon color="action" />
          <span>Qurilma dasturga mosligi</span>
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2.5}>
          <Alert severity="info" variant="outlined">
            <Typography variant="body2" fontWeight={600} gutterBottom>
              ZAXIRA dasturi uchun minimum talablar
            </Typography>
            <Typography variant="body2" component="div">
              • Protsessor: {MIN_REQUIREMENTS.processor}
              <br />
              • RAM: kamida {MIN_REQUIREMENTS.ramGb} GB
              <br />• Disk: kamida {MIN_REQUIREMENTS.storageGb} GB
            </Typography>
          </Alert>

          <Box>
            <Button
              variant="contained"
              onClick={runCheck}
              disabled={isChecking}
              startIcon={
                isChecking ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <RefreshOutlinedIcon />
                )
              }
              fullWidth
            >
              Qurilma dasturga mosligini tekshirish
            </Button>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
              Tekshiruv tugmasini bosgandan keyin natija shu oynada chiqadi. Bildirishnoma ham
              yuboriladi.
            </Typography>
          </Box>

          {isChecking ? (
            <Stack spacing={1}>
              <LinearProgress />
              <Typography variant="body2" color="text.secondary" align="center">
                Protsessor, RAM va disk xotirasi tahlil qilinmoqda...
              </Typography>
            </Stack>
          ) : null}

          {hasResult ? (
            <DeviceCompatibilityResults result={result} error={error} />
          ) : !isChecking ? (
            <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
              Tekshiruvni boshlash uchun yuqoridagi tugmani bosing.
            </Typography>
          ) : null}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={isChecking}>
          Yopish
        </Button>
        {hasResult ? (
          <Button
            variant="outlined"
            onClick={runCheck}
            disabled={isChecking}
            startIcon={<RefreshOutlinedIcon />}
          >
            Qayta tekshirish
          </Button>
        ) : null}
      </DialogActions>
    </Dialog>
  )
}
