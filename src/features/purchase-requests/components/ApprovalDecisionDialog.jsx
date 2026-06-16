import { useEffect, useMemo, useState } from 'react'
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { getDecisionChipColor } from '@/features/purchase-requests/utils/purchaseRequestStatus'

const COMMISSION_DECISION_OPTIONS = [
  { value: 'APPROVED', label: 'Kelishish', resultLabel: 'Kelishildi', color: 'success' },
  {
    value: 'PARTIAL',
    label: 'Qisman kelishish',
    resultLabel: 'Qisman kelishildi',
    color: 'info',
  },
  { value: 'REJECTED', label: 'Rad etish', resultLabel: 'Rad etildi', color: 'error' },
]

const BOSS_DECISION_OPTIONS = [
  { value: 'APPROVED', label: 'Kelishish', resultLabel: 'Kelishildi', color: 'success' },
  { value: 'REJECTED', label: 'Rad etish', resultLabel: 'Rad etildi', color: 'error' },
]

const COMMISSION_HINTS = {
  APPROVED: 'Ariza to‘liq kelishilgan hisoblanadi.',
  PARTIAL:
    'Qisman kelishish ham kelishilgan deb qabul qilinadi. Jarayon davom etadi.',
  REJECTED:
    'Ariza beruvchiga xabar boradi. U tuzatib qayta yuborishi va sizga yana kelishish uchun yuborishi mumkin.',
}

const BOSS_HINTS = {
  APPROVED: 'Ariza kelishiladi va holat «Sotib olinmoqda» ga o‘tadi.',
  REJECTED:
    'Ariza rad etiladi. Ariza beruvchi tuzatib qayta yuborishi mumkin — faqat boshliqqa boradi.',
}

export const ApprovalDecisionDialog = ({
  open,
  loading,
  onClose,
  onSubmit,
  title = 'Qaror',
  presetDecision = null,
  hint,
  mode = 'commission',
}) => {
  const [decision, setDecision] = useState('')
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')

  const lockedDecision = presetDecision ?? null
  const isBossMode = mode === 'boss'
  const decisionOptions = isBossMode ? BOSS_DECISION_OPTIONS : COMMISSION_DECISION_OPTIONS

  const selectedOption = useMemo(
    () => decisionOptions.find((option) => option.value === decision),
    [decision, decisionOptions],
  )

  const resolvedHint =
    hint ?? (lockedDecision ? (isBossMode ? BOSS_HINTS : COMMISSION_HINTS)[lockedDecision] : null)

  useEffect(() => {
    if (!open) return
    setDecision(lockedDecision ?? '')
    setComment('')
    setError('')
  }, [open, lockedDecision])

  const handleSubmit = async () => {
    if (!decision) {
      setError('Qaror turini tanlang')
      return
    }

    if (!comment.trim()) {
      setError('Izoh majburiy')
      return
    }

    try {
      await onSubmit({ decision, comment: comment.trim() })
    } catch (err) {
      setError(err.message || 'Saqlashda xatolik')
    }
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 600 }}>{title}</DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error ? <Alert severity="error">{error}</Alert> : null}

          {lockedDecision && selectedOption ? (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Qaror turi
              </Typography>
              <Chip
                label={selectedOption.resultLabel}
                color={getDecisionChipColor(lockedDecision)}
                sx={{ fontWeight: 600 }}
              />
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                Qaror turi
              </Typography>
              <ToggleButtonGroup
                exclusive
                value={decision}
                onChange={(_event, value) => value && setDecision(value)}
                disabled={loading}
                sx={{ display: 'flex', width: '100%' }}
              >
                {decisionOptions.map((option) => (
                  <ToggleButton
                    key={option.value}
                    value={option.value}
                    color={option.color}
                    sx={{ flex: 1, py: 1.25, textTransform: 'none' }}
                  >
                    {option.label}
                  </ToggleButton>
                ))}
              </ToggleButtonGroup>
            </Box>
          )}

          {resolvedHint ? (
            <Alert severity="info" sx={{ py: 0.5 }}>
              {resolvedHint}
            </Alert>
          ) : null}

          <TextField
            label="Izoh"
            multiline
            minRows={4}
            value={comment}
            onChange={(event) => setComment(event.target.value)}
            disabled={loading}
            fullWidth
            placeholder="Qaroringiz sababini batafsil yozing..."
            required
          />
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Bekor qilish
        </Button>
        <Button
          variant="contained"
          color={selectedOption?.color ?? 'primary'}
          onClick={handleSubmit}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : null}
        >
          Saqlash
        </Button>
      </DialogActions>
    </Dialog>
  )
}
