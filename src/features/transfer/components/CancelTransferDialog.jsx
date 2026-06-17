import { useEffect, useState } from 'react'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { useCancelTransferMutation } from '@/features/transfer/api/transferApi'
import {
  TRANSFER_CANCEL_OTHER_REASON_KEY,
  TRANSFER_CANCEL_REASONS,
} from '@/features/transfer/constants/transferCancelReasons'
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage'

export const CancelTransferDialog = ({ open, dispatch, onClose, onSuccess }) => {
  const [reasonKey, setReasonKey] = useState('')
  const [reasonOther, setReasonOther] = useState('')

  const [cancelTransfer, cancelState] = useCancelTransferMutation()

  const showOtherField = reasonKey === TRANSFER_CANCEL_OTHER_REASON_KEY

  useEffect(() => {
    if (!open) {
      setReasonKey('')
      setReasonOther('')
    }
  }, [open])

  const handleSubmit = async () => {
    if (!dispatch?.id || !reasonKey) return

    try {
      await cancelTransfer({
        id: dispatch.id,
        body: {
          reasonKey,
          ...(showOtherField ? { reasonOther: reasonOther.trim() } : {}),
        },
      }).unwrap()
      onSuccess?.()
      onClose()
    } catch {
      // error shown below
    }
  }

  const canSubmit =
    Boolean(reasonKey) && (!showOtherField || reasonOther.trim().length > 0)

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transferni bekor qilish</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          <Alert severity="warning">
            Rostdan ham <strong>{dispatch?.dispatchCode}</strong> transferini bekor qilasizmi?
            Barcha tovarlar jo‘natuvchi omboriga qaytariladi.
          </Alert>

          <Typography variant="body2" color="text.secondary">
            Bekor qilish sababini tanlang. Bu yozuv transfer tarixida va tovar tarixida saqlanadi.
          </Typography>

          <FormControl size="small" fullWidth required>
            <InputLabel id="cancel-transfer-reason-label">Bekor qilish sababi</InputLabel>
            <Select
              labelId="cancel-transfer-reason-label"
              label="Bekor qilish sababi"
              value={reasonKey}
              onChange={(event) => setReasonKey(event.target.value)}
              renderValue={(selected) =>
                TRANSFER_CANCEL_REASONS.find((reason) => reason.key === selected)?.label ??
                selected
              }
            >
              {TRANSFER_CANCEL_REASONS.map((reason) => (
                <MenuItem key={reason.key} value={reason.key}>
                  {reason.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {showOtherField ? (
            <TextField
              size="small"
              label="Izoh"
              value={reasonOther}
              onChange={(event) => setReasonOther(event.target.value)}
              multiline
              minRows={2}
              required
              fullWidth
              placeholder="Bekor qilish sababini yozing..."
            />
          ) : null}

          {cancelState.isError ? (
            <Alert severity="error">
              {getApiErrorMessage(cancelState.error, 'Transferni bekor qilib bo‘lmadi')}
            </Alert>
          ) : null}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={cancelState.isLoading}>
          Yopish
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={!canSubmit || cancelState.isLoading}
        >
          {cancelState.isLoading ? 'Bekor qilinmoqda...' : 'Bekor qilish'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}
